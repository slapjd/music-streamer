import { type ITrack, type IMusicQueue, defaultTrack, type IObservable } from "./Interfaces"
import type { Socket } from "socket.io-client"
import { computed, ref, type Ref, type WritableComputedRef } from "vue"
import { BaseObservable } from "./BaseObservable"

export class RemoteMusicQueue extends BaseObservable implements IMusicQueue {
    private _socket: Socket
    private _currentTrack: ITrack = defaultTrack
    private _shuffle = false //Cached value. Updates when websocket says to
    private _preview = this._currentTrack


    public trackList: ITrack[] = []
    public readonly remote: boolean = true

    public get currentTrack() {
        return this._currentTrack
    }
    public set currentTrack(value) {
        this._socket.emit("changeTrack", value)
    }

    public get shuffle() : boolean {
        return this._shuffle
    }
    public set shuffle(v : boolean) {
        this._socket.emit("shuffleState", v)
    }
    
    public get preview() : ITrack {
        return this._preview
    }
    

    public playbackComplete(): void {} //We don't *really* give a shit because host controls auto track changes
    public next(): void {
        this._socket.emit("next")
    }
    public previous(): void {
        this._socket.emit("previous")
    }
    public add(track: ITrack): void {
        this._socket.emit("addTrack", track)
    }
    public remove(track: ITrack): void {
        this._socket.emit("removeTrack", track)
    }
    public select(track: ITrack): void {
        this._socket.emit("changeTrack", track)
    }

    constructor(socket: Socket) {
        super()
        this._socket = socket

        this._socket.on('changeTrackHost', ([track, preview]) => {
            this._currentTrack = track
            this._preview = preview

            this.notify()
        })
        this._socket.on('shuffleStateHost', ([shuffle]) => {
            this._shuffle = shuffle

            this.notify()
        })
        this._socket.on('queueUpdateHost', ([trackList]) => {
            this.trackList = trackList

            this.notify()
        })

        this._socket.emit('remoteQueueJoined')
    }
    
}