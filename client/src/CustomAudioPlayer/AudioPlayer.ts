import type { IAudioPlayer } from "./IAudioPlayer";

export class AudioPlayer implements IAudioPlayer {
    private _audioContext: AudioContext
    private _bufferAudioSrc: AudioBufferSourceNode
    private _gainNode: GainNode

    
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
    

    play(): void {
        throw new Error("Method not implemented.");
    }
    pause(): void {
        throw new Error("Method not implemented.");
    }
    next(): void {
        throw new Error("Method not implemented.");
    }
    previous(): void {
        throw new Error("Method not implemented.");
    }

    constructor() {
        this._audioContext = new AudioContext()
        this._bufferAudioSrc = this._audioContext.createBufferSource()
        this._gainNode = this._audioContext.createGain()
        this._gainNode.gain.maxValue

        fetch("TEST.com")
        .then(res => res.arrayBuffer())
        .then(res => this._audioContext.decodeAudioData(res, buf => {
            this._bufferAudioSrc.buffer = buf
        }))
    }
    
}