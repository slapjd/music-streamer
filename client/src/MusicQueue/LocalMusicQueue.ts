import type { ITrack, IMusicQueue } from "./Interfaces"
import type { IObservable } from "@/Observable/IObservable"
import { defaultTrack } from "./Interfaces"
import type { Socket } from "socket.io-client"
import rng from "../SeededRng/SeededRng"
import { BaseObservable } from "../Observable/BaseObservable"
import { ObservableList } from "../Observable/ObservableList"

export class LocalMusicQueue extends BaseObservable implements IMusicQueue{
    //TODO: If trackList is appended there will not be a notification. That should probably be fixed but requires lots of boilerplate
    private _shuffleSeed
    private _availableShuffleTracks: ITrack[]
    private _previousStack: ITrack[]
    private _nextStack: ITrack[]
    private _socket: Socket
    private _shuffle: boolean
    private _currentTrack: ITrack
    private _trackList: ObservableList<ITrack>

    private get currentTrackIndex() : number {
        return this.trackList.findIndex(track => track.id == this.currentTrack.id)
    }


    public readonly remote: boolean = false
    
    public get trackList() : ITrack[] {
        return this._trackList
    }
    
    public set trackList(v : ITrack[]) {
        this._trackList.replaceAll(v);

        this._socket.emit("queueUpdateHost", v)
    }
    
    public get currentTrack() : ITrack {
        return this._currentTrack
    }
    public set currentTrack(v : ITrack) {
        this._currentTrack = v;

        //Shuffle magic (attempts not to repeat tracks too much)
        this._availableShuffleTracks = this._availableShuffleTracks.filter(track => !(track.id == this.currentTrack.id))
        if (this._availableShuffleTracks.length < 1) this._availableShuffleTracks = this.trackList.filter(track => !(track.id == this.currentTrack.id))
        this._shuffleSeed++

        //Tell everyone we've changed things
        this.notify()
        this._socket.emit("changeTrackHost", v, this.preview)
    }

    public get shuffle(): boolean {
        return this._shuffle
    }
    public set shuffle(value: boolean) {
        this._shuffle = value

        //Tell everyone we've changed things
        this.notify()
        this._socket.emit("shuffleStateHost", value)
    }

    public get preview() : ITrack {
        if (this._nextStack.length > 0) return this._nextStack[this._nextStack.length - 1]
        else if (this.shuffle) return this.getNextShuffle()
        else return this.getNextNoShuffle()
    }

    
    private getNextShuffle(): ITrack {
        return this._availableShuffleTracks[rng.sfc32(rng.cyrb128(this._shuffleSeed.toString())) % this._availableShuffleTracks.length]
    }

    private getNextNoShuffle(): ITrack {
        return this.trackList[(this.currentTrackIndex + 1) % this.trackList.length]
    }


    public playbackComplete(): void {
        this.next()
    }

    public next(): ITrack {
        this._previousStack.push(this.currentTrack)

        if (this._nextStack.length > 0) {
            this.currentTrack = this._nextStack.pop()!
        }
        else if (this.shuffle) {
            this.currentTrack = this.getNextShuffle()
        } else {
            this.currentTrack = this.getNextNoShuffle()
        }

        return this.currentTrack
    }

    public previous(): ITrack {
        this._nextStack.push(this.currentTrack)

        if (this._previousStack.length > 0) {
            this.currentTrack = this._previousStack.pop()!
        } else if (this.shuffle) { //Actually the same as next ironically
            this.currentTrack = this.getNextShuffle()
        } else {
            this.currentTrack = this.trackList[((this.currentTrackIndex + this.trackList.length) - 1) % this.trackList.length]
        }

        return this.currentTrack
    }

    public add(track: ITrack): void {
        this.trackList.push(track)
        this._availableShuffleTracks.push(track) //Add new track as available to be shuffled in
    }

    public remove(track: ITrack): void {
        this.trackList = this.trackList.filter(existing_track => !(existing_track.id == track.id))
        this._availableShuffleTracks = this._availableShuffleTracks.filter(existing_track => !(existing_track.id == track.id))
        //TODO: removing current track from queue what do?
    }

    public select(track: ITrack): void {
        this.currentTrack = track //Set new track
    }

    constructor(socket: Socket) {
        super()
        this._shuffleSeed = new Date().getTime()
        this._availableShuffleTracks = []
        this._previousStack = []
        this._nextStack = []
        this._socket = socket
        this._shuffle = false
        this._currentTrack = defaultTrack
        this._trackList = new ObservableList<ITrack>()

        //When trackList changes, we want to notify others
        //Must be bound to `this` otherwise when trackList calls notify it doesn't know what `this` is for some reason
        this._trackList.subscribe(this.notify.bind(this))

        socket.on("queueUpdate", ([trackList]) => {
            this.trackList = trackList
        })

        this._socket.on('remoteQueueJoined', () => {
            this._socket.emit("queueUpdateHost", this.trackList)
            this._socket.emit("changeTrackHost", this.currentTrack, this.preview)
            this._socket.emit("shuffleState", (this.shuffle))
        })

        socket.on("changeTrack", ([current]) => {
            this.currentTrack = current
        })

        socket.on("shuffleState", ([shuffle]) => {
            this.shuffle = shuffle
        })

        socket.on("next", () => {
            this.next()
        })

        socket.on("previous", () => {
            this.previous()
        })

        socket.on("addTrack", ([track]) => {
            this.add(track)
        })

        socket.on("removeTrack", ([track]) => {
            this.remove(track)
        })
    }
}