import type { ITrack, IMusicQueue } from "./IMusicQueue"
import type { Socket } from "socket.io-client"

export class RemoteMusicQueue implements IMusicQueue {
    private _socket: Socket
    private _currentTrack: ITrack = {
        id: -1,
        title: "",
        artist: "",
        album: {
            title: ""
        }
    }
    private _shuffle = false //Cached value. Updates when websocket says to
    private _preview = this._currentTrack


    public trackList: ITrack[] = []


    public get currentTrack() : ITrack {
        return this._currentTrack
    }
    public set currentTrack(v : ITrack) {
        this._socket.emit("changeTrack", v)
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
    

    public onchange(): void {}
    public playbackComplete(): void {} //Not our problem baybeee
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
        this._socket = socket

        this._socket.on('changeTrackHost', ([track, preview]) => {
            this._currentTrack = track
            this._preview = preview

            this.onchange()
        })
        this._socket.on('shuffleStateHost', ([shuffle]) => {
            this._shuffle = shuffle
        })
        this._socket.on('queueUpdateHost', ([trackList]) => {
            console.table(trackList)
            this.trackList = trackList
        })

        this._socket.emit('remoteJoined')
    }
    
}