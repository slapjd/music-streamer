import type { IAudioPlayer } from "./IAudioPlayer";
import type { ChangeTrackEvent, SynchronizedObservableMusicQueue } from "@/MusicQueue/SynchronizedObservableMusicQueue"
import { EventDispatcher, type Handler } from "@/EventHelper/EventHelper";

export interface DurationChangeEvent {
    duration: number
}

export interface TimeChangeEvent {
    time: number
}

export class SynchronizedAudioPlayer implements IAudioPlayer {
    private _audioContext: AudioContext
    private _bufferAudioSrc: AudioBufferSourceNode
    private _htmlAudioSrc: MediaElementAudioSourceNode
    private _gainNode: GainNode
    private _audioCache: Map<number, AudioBuffer>

    private _paused: boolean
    private _pausedTime: number
    private _startTime: number

    private _queue: SynchronizedObservableMusicQueue

    
    public get volume() : number {
        return this._gainNode.gain.value
    }
    public set volume(value: number) {
        const gain = this._gainNode.gain
        console.debug("VOLUME:", gain)
        gain.value = value
    }

    private async _changeTrackHandler({current, next}: ChangeTrackEvent) {
        this._htmlAudioSrc.mediaElement.src = "/api/media/tracks/" + this._queue.currentTrack.id + "/file"

        //Check cache
        var currentBuf = this._audioCache.get(current.id)
        if (!currentBuf) {
            //Add audio to cache for the future
            fetch("/api/media/tracks/" + current.id + "/file").then((res) => {
                res.arrayBuffer().then((arrBuf) => {
                    this._audioContext.decodeAudioData(arrBuf).then((audioBuf) => {
                        this._audioCache.set(current.id, audioBuf)
                    })
                })
            })
        }
        
        this._destroyBufferSrc()
        this._pausedTime = 0
        if (!this._paused) this.play()

        fetch("/api/media/tracks/" + next.id + "/file").then((res) => {
            res.arrayBuffer().then((arrBuf) => {
                this._audioContext.decodeAudioData(arrBuf).then((audioBuf) => {
                    this._audioCache.set(next.id, audioBuf)
                })
            })
        })
        
    }

    private _createBufferSrc(buffer?: AudioBuffer) {
        this._bufferAudioSrc = this._audioContext.createBufferSource()
        if (buffer) {
            this._bufferAudioSrc.buffer = buffer
        }
        this._bufferAudioSrc.connect(this._gainNode)

        //TODO: host check
        this._bufferAudioSrc.onended = () => {
            this._queue.next()
        }
    }

    private _destroyBufferSrc() {
        this._bufferAudioSrc.onended = null
        this._bufferAudioSrc.stop()
        this._bufferAudioSrc.disconnect()
    }

    private _durationChangeEventDispatcher: EventDispatcher<DurationChangeEvent>
    onDurationChange(handler: Handler<DurationChangeEvent>) {
        this._durationChangeEventDispatcher.register(handler)
    }

    private _timeChangeEventDispatcher: EventDispatcher<TimeChangeEvent>
    onTimeChange(handler: Handler<TimeChangeEvent>) {
        this._timeChangeEventDispatcher.register(handler)
    }
    
    set currentTime(value: number) {
        this.pause()
        this._pausedTime = value
        this.play()
    }

    togglePlay(): void {
        if (this._paused) this.play()
        else this.pause()
    }
    play(): void {
        if (this._audioContext.state === "suspended") {
            this._audioContext.resume()
        }
        
        //Check audio cache
        const currentBuf = this._audioCache.get(this._queue.currentTrack.id)
        this._paused = false
        this._startTime = this._audioContext.currentTime - this._pausedTime
        if (!currentBuf) {
            //Audio not cached, use HTMLMediaSource to avoid loading latency as much as possible
            this._htmlAudioSrc.connect(this._gainNode)
            this._htmlAudioSrc.mediaElement.currentTime = this._pausedTime
            this._htmlAudioSrc.mediaElement.play()
            this._durationChangeEventDispatcher.fire({duration: this._htmlAudioSrc.mediaElement.duration})
        } else {
            //Audio cached, make buffersource
            this._createBufferSrc(currentBuf)
            this._bufferAudioSrc.start(0, this._pausedTime)
            this._durationChangeEventDispatcher.fire({duration: currentBuf.duration})
        }

        //TODO: figure out ontimeupdate for buffersrc
        this._timeChangeEventDispatcher.fire({time: this._pausedTime})
    }
    pause(): void {
        this._paused = true
        this._pausedTime = this._audioContext.currentTime - this._startTime
        this._destroyBufferSrc()
        this._htmlAudioSrc.mediaElement.pause()
        this._htmlAudioSrc.disconnect()
    }
    next(): void {
        this._queue.next()
    }
    previous(): void {
        this._queue.previous()
    }
    seek(time: number) {
        this._pausedTime = time
        this._bufferAudioSrc.stop()
        this.play()
    }

    constructor(queue: SynchronizedObservableMusicQueue) {
        this._audioContext = new AudioContext()
        this._gainNode = this._audioContext.createGain()
        this._gainNode.connect(this._audioContext.destination)
        
        this._createBufferSrc()
        this._bufferAudioSrc.start() //easier
        this._htmlAudioSrc = this._audioContext.createMediaElementSource(new Audio())

        this._audioCache = new Map()
        this._paused = true
        this._pausedTime = 0
        this._queue = queue
        this._startTime = 0

        this._queue.onChangeTrack(this._changeTrackHandler.bind(this))
        this._htmlAudioSrc.mediaElement.onended = () => { //TODO: host check
            this._queue.next()
        }
        this._htmlAudioSrc.mediaElement.ontimeupdate = () => {
            this._timeChangeEventDispatcher.fire({time: this._htmlAudioSrc.mediaElement.currentTime})
        }

        this._durationChangeEventDispatcher = new EventDispatcher()
        this._timeChangeEventDispatcher = new EventDispatcher()
    }
    
}