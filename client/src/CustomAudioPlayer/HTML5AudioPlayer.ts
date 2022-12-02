import type { IAudioPlayer } from "./IAudioPlayer";
import type { ChangeTrackEvent, SynchronizedObservableMusicQueue } from "@/MusicQueue/SynchronizedObservableMusicQueue"
import { EventDispatcher, type Handler } from "@/EventHelper/EventHelper";
import type { Socket } from "socket.io-client";

export class SynchronizedAudioPlayer {
    private _player: HTMLAudioElement
    private _nextPlayer: HTMLAudioElement
    private _queue: SynchronizedObservableMusicQueue
    private _socket: Socket

    private _paused: boolean

    get duration() {
        return this._player.duration
    }

    get currentTime() {
        return this._player.currentTime
    }
    set currentTime(v) {
        this._player.currentTime = v
        this._socket.emit("seek", v)
    }

    get volume() {
        return this._player.volume
    }
    set volume(v) {
        this._player.volume = v
    }

    get ondurationchange() {
        return this._player.ondurationchange
    }
    set ondurationchange(v) {
        this._player.ondurationchange = v
        this._nextPlayer.ondurationchange = v
    }

    get ontimeupdate() {
        return this._player.ontimeupdate
    }
    set ontimeupdate(v) {
        this._player.ontimeupdate = v
        this._nextPlayer.ontimeupdate = v
    }

    private _silentPlay() {
        this._paused = false
        return this._player.play()
    }
    play() {
        const output = this._silentPlay()
        this._socket.emit("play")
        return output
    }

    private _silentPause() {
        this._paused = true
        return this._player.pause()
    }
    pause() {
        const output = this._silentPause()
        this._socket.emit("pause")
        return output
    }

    togglePlay() {
        if (this._player.paused) this.play()
        else this.pause()
    }

    constructor(queue: SynchronizedObservableMusicQueue, socket: Socket) {
        this._player = new Audio()
        this._nextPlayer = new Audio()
        this._player.preload = "auto"
        this._nextPlayer.preload = "auto"

        this._queue = queue
        this._socket = socket

        this._paused = this._player.paused

        this._queue.onChangeTrack(({current, next}) => {
            console.log("TRACKCHANGE_NEXT_SRC:", this._nextPlayer.src)
            if (this._nextPlayer.src.includes("/api/media/tracks/" + current.id + "/file")) {
                //track already cached, so we use that cached player
                //Swap players
                const tempPlayer = this._player
                this._player = this._nextPlayer
                this._nextPlayer = tempPlayer

                //Start track if required (already cached)
                if (!this._paused) this._player.play()
                this._nextPlayer.pause()
                console.log("CACHED_TRACKCHANGE")
            } else {
                //Track not cached, set src manually
                //To help keep everyone synchronized, we try to compensate for media loading time
                const time = Date.now()
                const oldloaded = this._player.onloadeddata
                const onmediaload = () => {
                    const timediff = (Date.now() - time) / 1000
                    this._player.currentTime = timediff
                    if (!this._paused) this._player.play()
                    
                    this._player.onloadeddata = oldloaded
                }
                this._player.onloadeddata = onmediaload
                this._player.src = "/api/media/tracks/" + current.id + "/file"
            }

            
            

            //Cache next track
            this._nextPlayer.src = "/api/media/tracks/" + next.id + "/file"
            
        })

        this._socket.on("play", () => {
            this._silentPlay()
        })
        this._socket.on("pause", () => {
            this._silentPause()
        })
        this._socket.on("seek", ([time]) => {
            this._player.currentTime = time
        })

        this._socket.on("becomeHost", () => {
            const endedev = () => {
                queue.next()
            }
            this._player.onended = endedev
            this._nextPlayer.onended = endedev
        })
    }
}