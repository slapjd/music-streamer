import type { ITrack, IMusicQueue } from "./Interfaces"
import type { IObservable } from "@/Observable/IObservable"
import { defaultTrack } from "./Interfaces"
import type { Socket } from "socket.io-client"
import { SeededRng } from "../SeededRng/SeededRng"
import { ObservableStateManager } from "../Observable/ObservableHelper"
import { ObservableArrayMixin } from "../Observable/ObservableArray"
import { ObservableAwareShuffler } from "@/SeededRng/Shuffler"

class TrackList extends ObservableArrayMixin(Array<ITrack>) {}

export class SynchronizedObservableMusicQueueHost extends ObservableStateManager implements IMusicQueue{
    //TODO: If trackList is appended there will not be a notification. That should probably be fixed but requires lots of boilerplate
    private _rng: SeededRng
    private _shuffler: ObservableAwareShuffler<ITrack>
    private _previousStack: ITrack[]
    private _nextStack: ITrack[]
    private _socket: Socket
    private _shuffle: boolean
    private _currentTrack: ITrack
    private _trackList: TrackList

    private get _currentTrackIndex() : number {
        return this.trackList.findIndex(track => track.id == this._currentTrack.id)
    }


    public readonly remote: boolean = false
    
    public get trackList() : ITrack[] {
        return this._trackList
    }
    
    public set trackList(v : ITrack[]) {
        this._trackList.replaceAll(v);

        this._socket.emit("queueUpdateHost", v)
    }
    
    public get _currentTrack() : ITrack {
        return this._currentTrack
    }
    public set _currentTrack(v : ITrack) {
        this._currentTrack = v;

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
        else if (this.shuffle) return this._shuffler.peek()
        else return this._getNextNoShuffle()
    }

    private _getNextNoShuffle(): ITrack {
        return this.trackList[(this._currentTrackIndex + 1) % this.trackList.length]
    }

    public next(): ITrack {
        this._previousStack.push(this._currentTrack)

        if (this._nextStack.length > 0) {
            this._currentTrack = this._nextStack.pop()!
        }
        else if (this.shuffle) {
            this._currentTrack = this._shuffler.next()
        } else {
            this._currentTrack = this._getNextNoShuffle()
        }

        return this._currentTrack
    }

    public previous(): ITrack {
        this._nextStack.push(this._currentTrack)

        if (this._previousStack.length > 0) {
            this._currentTrack = this._previousStack.pop()!
        } else if (this.shuffle) { //Actually the same as next ironically
            this._currentTrack = this._shuffler.next()
        } else {
            this._currentTrack = this.trackList[((this._currentTrackIndex + this.trackList.length) - 1) % this.trackList.length]
        }

        return this._currentTrack
    }

    public add(track: ITrack): void {
        this.trackList.push(track)
    }

    public remove(track: ITrack): void {
        this.trackList = this.trackList.filter(existing_track => !(existing_track.id == track.id))
        //TODO: removing current track from queue what do?
    }

    public select(track: ITrack): void {
        this._currentTrack = track //Set new track
    }

    constructor(socket: Socket) {
        super()
        this._rng = new SeededRng()
        this._previousStack = []
        this._nextStack = []
        this._socket = socket
        this._shuffle = false
        this._currentTrack = defaultTrack
        this._trackList = new TrackList()
        this._shuffler = new ObservableAwareShuffler(this._trackList, this._rng)

        //When trackList changes, we want to notify others
        //Must be bound to `this` otherwise when trackList calls notify it doesn't know what `this` is for some reason
        this._trackList.subscribe(this.notify.bind(this))

        socket.on("queueUpdate", ([trackList]) => {
            this.trackList = trackList
        })

        this._socket.on('remoteQueueJoined', () => {
            this._socket.emit("queueUpdateHost", this.trackList)
            this._socket.emit("changeTrackHost", this._currentTrack, this.preview)
            this._socket.emit("shuffleState", (this.shuffle))
        })

        socket.on("changeTrack", ([current]) => {
            this._currentTrack = current
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