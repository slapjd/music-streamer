import type { IAudioPlayer } from "./IAudioPlayer";
import type { ChangeTrackEvent, SynchronizedObservableMusicQueue } from "@/MusicQueue/SynchronizedObservableMusicQueue"
import { EventDispatcher, type Handler } from "@/EventHelper/EventHelper";

export interface DurationChangeEvent {
    duration: number
}

export interface TimeChangeEvent {
    time: number
}

export class AudioPlayer implements IAudioPlayer {
    private _audioContext: AudioContext
    private _bufferAudioSrc: AudioBufferSourceNode
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

    private _setupBufferSrc() {

    }

    private async _changeTrackHandler({current, next}: ChangeTrackEvent) {
        var currentBuf = this._audioCache.get(current.id)
        if (!currentBuf) {
            const res = await fetch("/api/media/tracks/" + current.id + "/file")
            const arrBuf = await res.arrayBuffer()
            currentBuf = await this._audioContext.decodeAudioData(arrBuf)
            this._audioCache.set(current.id, currentBuf)
        }
        
        this._bufferAudioSrc.stop()
        this._bufferAudioSrc.disconnect()

        this._pausedTime = 0
        //TODO: Actual gapless fucking somehow
        this._durationChangeEventDispatcher.fire({duration: currentBuf.duration})
        if (!this._paused) this.play()

        const res = await fetch("/api/media/tracks/" + next.id + "/file")
        const arrBuf = await res.arrayBuffer()
        this._audioCache.set(next.id, await this._audioContext.decodeAudioData(arrBuf))
    }

    private _durationChangeEventDispatcher: EventDispatcher<DurationChangeEvent>
    onDurationChange(handler: Handler<DurationChangeEvent>) {
        this._durationChangeEventDispatcher.register(handler)
    }

    private _timeChangeEventDispatcher: EventDispatcher<TimeChangeEvent>
    onTimeChange(handler: Handler<TimeChangeEvent>) {
        this._timeChangeEventDispatcher.register(handler)
    }
    

    togglePlay(): void {
        if (this._paused) this.play()
        else this.pause()
    }
    play(): void {
        if (this._audioContext.state === "suspended") {
            this._audioContext.resume()
        }

        this._bufferAudioSrc = this._audioContext.createBufferSource()
        //Current track should *always* be loaded in cache
        this._bufferAudioSrc.buffer = this._audioCache.get(this._queue.currentTrack.id)!
        this._bufferAudioSrc.connect(this._gainNode)
        
        this._paused = false
        this._startTime = this._audioContext.currentTime - this._pausedTime
        this._bufferAudioSrc.start(0, this._pausedTime)
        this._timeChangeEventDispatcher.fire({time: this._pausedTime})
    }
    pause(): void {
        this._paused = true
        this._pausedTime = this._audioContext.currentTime - this._startTime
        this._bufferAudioSrc.stop()
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
        this._bufferAudioSrc = this._audioContext.createBufferSource()
        this._bufferAudioSrc.start()
        this._gainNode = this._audioContext.createGain()
        this._gainNode.connect(this._audioContext.destination)

        this._audioCache = new Map()
        this._paused = true
        this._pausedTime = 0
        this._queue = queue
        this._startTime = 0

        this._queue.onChangeTrack(this._changeTrackHandler.bind(this))

        this._durationChangeEventDispatcher = new EventDispatcher()
        this._timeChangeEventDispatcher = new EventDispatcher()
    }
    
}