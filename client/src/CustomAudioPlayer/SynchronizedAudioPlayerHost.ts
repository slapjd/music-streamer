import type { IMusicQueue } from "@/MusicQueue/Interfaces"
import type { IObservable } from "@/Observable/IObservable"

export class SynchronizedAudioPlayerHost {
    private _audioContext: AudioContext
    private queue: IObservable & IMusicQueue

    constructor(queue: IObservable & IMusicQueue) {
        try{
            this._audioContext = new AudioContext()
        } catch (e) {
            throw "WEBAUDIO_NOT_SUPPORTED"
        }

        this.queue = queue

        
    }
}