import type { IAudioPlayer } from "./IAudioPlayer";
import type { ChangeTrackEvent, SynchronizedObservableMusicQueue } from "@/MusicQueue/SynchronizedObservableMusicQueue"

export class AudioPlayer implements IAudioPlayer {
    private _audioContext: AudioContext
    private _bufferAudioSrc: AudioBufferSourceNode
    private _gainNode: GainNode
    private _audioCache: Map<number, AudioBuffer>

    private _paused: boolean

    private _queue: SynchronizedObservableMusicQueue

    
    public get volume() : number {
        const gain = this._gainNode.gain
        return (gain.value - gain.minValue) / (gain.maxValue - gain.minValue)
    }
    public set volume(value: number) {
        const gain = this._gainNode.gain
        if (value > 1) gain.value = gain.maxValue
        else if (value < 0) gain.value = gain.minValue
        else {
            gain.value = ((gain.maxValue - gain.minValue) * value) + gain.minValue
        }
    }

    private async _changeTrackHandler({current, next}: ChangeTrackEvent) {
        var currentBuf = this._audioCache.get(current.id)
        if (!currentBuf) {
            const res = await fetch("/api/media/tracks/" + current.id + "/file")
            const arrBuf = await res.arrayBuffer()
            currentBuf = await this._audioContext.decodeAudioData(arrBuf)
            this._audioCache.set(current.id, currentBuf)
        }

        this._bufferAudioSrc.disconnect()
        this._bufferAudioSrc = this._audioContext.createBufferSource()
        if (this._paused) this._bufferAudioSrc.playbackRate.value = 0
        this._bufferAudioSrc.connect(this._gainNode)
        this._bufferAudioSrc.start()

        const res = await fetch("/api/media/tracks/" + next.id + "/file")
        const arrBuf = await res.arrayBuffer()
        this._audioCache.set(next.id, await this._audioContext.decodeAudioData(arrBuf))
    }
    

    togglePlay(): void {
        if (this._paused) this.play()
        else this.pause()
    }
    play(): void {
        this._paused = false
        this._bufferAudioSrc.playbackRate.value = 1
    }
    pause(): void {
        this._paused = true
        this._bufferAudioSrc.playbackRate.value = 0
    }
    next(): void {
        throw new Error("Method not implemented.");
    }
    previous(): void {
        throw new Error("Method not implemented.");
    }

    constructor(queue: SynchronizedObservableMusicQueue) {
        this._audioContext = new AudioContext()
        this._bufferAudioSrc = this._audioContext.createBufferSource()
        this._gainNode = this._audioContext.createGain()
        this._gainNode.connect(this._audioContext.destination)

        this._audioCache = new Map()
        this._paused = true
        this._queue = queue

        this._queue.onChangeTrack(this._changeTrackHandler.bind(this))
    }
    
}