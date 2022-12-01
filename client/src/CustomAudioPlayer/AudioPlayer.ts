import type { IAudioPlayer } from "./IAudioPlayer";
import type { ChangeTrackEvent, SynchronizedObservableMusicQueue } from "@/MusicQueue/SynchronizedObservableMusicQueue"
import { EventDispatcher, type Handler } from "@/EventHelper/EventHelper";
import type { Socket } from "socket.io-client";

export class SynchronizedAudioPlayer {
    private _player: HTMLAudioElement
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
    }

    get ontimeupdate() {
        return this._player.ontimeupdate
    }
    set ontimeupdate(v) {
        this._player.ontimeupdate = v
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
        this._queue = queue
        this._socket = socket

        this._paused = this._player.paused

        this._queue.onChangeTrack(({current, next}) => {
            this._player.src = "/api/media/tracks/" + current.id + "/file"
            if (!this._paused) this._player.play()
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
            this._player.onended = () => {
                queue.next()
            }
        })
    }
}