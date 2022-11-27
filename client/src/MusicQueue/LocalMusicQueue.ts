import type { ITrack, IObservableMusicQueue } from "./IMusicQueue"
import { defaultTrack } from "./IMusicQueue"
import type { Socket } from "socket.io-client"

export class LocalMusicQueue implements IObservableMusicQueue{
    private _shuffleSeed = new Date().getTime()
    private _availableShuffleTracks: ITrack[] = []
    private _previousStack: ITrack[] = []
    private _nextStack: ITrack[] = []
    private _socket: Socket
    private _shuffle: boolean = false
    private _currentTrack: ITrack = defaultTrack
    private _subscribedEventListeners: VoidFunction[] = []

    private get currentTrackIndex() : number {
        return this.trackList.findIndex(track => track.id == this.currentTrack.id)
    }


    public trackList: ITrack[] = []

    
    public get currentTrack() : ITrack {
        return this._currentTrack
    }
    public set currentTrack(v : ITrack) {
        this._currentTrack = v;

        //Shuffle magic (attempts not to repeat tracks too much)
        this._availableShuffleTracks = this._availableShuffleTracks.filter(track => !(track.id == this.currentTrack.id))
        if (this._availableShuffleTracks.length < 1) this._availableShuffleTracks = this.trackList.filter(track => !(track.id == this.currentTrack.id))
        this._shuffleSeed++

        this.notify()

        this._socket.emit("changeTrackHost", v, this.preview)
    }

    public get shuffle(): boolean {
        return this._shuffle
    }
    public set shuffle(value: boolean) {
        this._shuffle = value

        this.notify()

        this._socket.emit("shuffleStateHost", value)
    }

    public get preview() : ITrack {
        if (this._nextStack.length > 0) return this._nextStack[this._nextStack.length - 1]
        else if (this.shuffle) return this.getNextShuffle()
        else return this.getNextNoShuffle()
    }
    

    //128-bit hash function
    private cyrb128(str: string): number[] {
        let h1 = 1779033703, h2 = 3144134277,
            h3 = 1013904242, h4 = 2773480762;
        for (let i = 0, k; i < str.length; i++) {
            k = str.charCodeAt(i);
            h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
            h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
            h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
            h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
        }
        h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
        h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
        h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
        h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
        return [(h1^h2^h3^h4)>>>0, (h2^h1)>>>0, (h3^h1)>>>0, (h4^h1)>>>0];
    }

    //32-bit PRNG with 128-bit seed
    private sfc32(seed: number[]): number {
        seed[0] >>>= 0; seed[1] >>>= 0; seed[2] >>>= 0; seed[3] >>>= 0; 
        var t = (seed[0] + seed[1]) | 0;
        seed[0] = seed[1] ^ seed[1] >>> 9;
        seed[1] = seed[2] + (seed[2] << 3) | 0;
        seed[2] = (seed[2] << 21 | seed[2] >>> 11);
        seed[3] = seed[3] + 1 | 0;
        t = t + seed[3] | 0;
        seed[2] = seed[2] + t | 0;
        return (t >>> 0) / 4294967296;
    }

    private getNextShuffle(): ITrack {
        return this._availableShuffleTracks[this.sfc32(this.cyrb128(this._shuffleSeed.toString())) % this._availableShuffleTracks.length]
    }

    private getNextNoShuffle(): ITrack {
        return this.trackList[(this.currentTrackIndex + 1) % this.trackList.length]
    }


    public notify(): void {
        this._subscribedEventListeners.forEach((callback) => {
            callback()
        })
    }

    public subscribe(callback: VoidFunction) {
        this._subscribedEventListeners.push(callback)
    }

    public unsubscribe(callback: VoidFunction): void {
        this._subscribedEventListeners.splice(this._subscribedEventListeners.findIndex((listener) => listener == callback), 1)
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

        this.notify()
        this._socket.emit("queueUpdateHost", this.trackList)
    }

    public remove(track: ITrack): void {
        this.trackList = this.trackList.filter(existing_track => !(existing_track.id == track.id))
        this._availableShuffleTracks = this._availableShuffleTracks.filter(existing_track => !(existing_track.id == track.id))
        //TODO: removing current track from queue what do?

        this.notify()
        this._socket.emit("queueUpdateHost", this.trackList)
    }

    public select(track: ITrack): void {
        this.currentTrack = track //Set new track
    }

    constructor(socket: Socket) {
        this._socket = socket

        socket.on("queueUpdate", ([trackList]) => {
            this.trackList = trackList
            this.notify()
            socket.emit("queueUpdateHost", trackList)
        })

        this._socket.on('remoteJoined', () => {
            this._socket.emit("queueUpdateHost", this.trackList)
            this._socket.emit("changeTrackHost", this.currentTrack, this.preview)
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