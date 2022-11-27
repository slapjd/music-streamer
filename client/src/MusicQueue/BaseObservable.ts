import type { IObservable } from "./Interfaces";

export class BaseObservable implements IObservable {
    private _subscribedEventListeners: VoidFunction[]

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

    constructor() {
        this._subscribedEventListeners = []
    }
}