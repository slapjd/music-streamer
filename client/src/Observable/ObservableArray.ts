import { ObservableStateManager, notifyWrapper } from "./ObservableStateManager";
import type { IObservable } from "./IObservable";
import type { ITrack } from "@/MusicQueue/Interfaces";

type GConstructor<T = any> = new (...args: any[]) => T;
type Arrayable<T> = GConstructor<Array<T>>

export function ObservableArrayMixin<T, TBase extends Arrayable<T>>(Base: TBase) {
    return class ObservableArray extends Base implements IObservable {
        private _subscribedEventListeners: VoidFunction[]

        public notify(): void {
            if (!this._subscribedEventListeners) return
            this._subscribedEventListeners.forEach((callback) => {
                if (callback) callback()
            })
        }

        public subscribe(callback: VoidFunction) {
            this._subscribedEventListeners.push(callback)
        }

        public unsubscribe(callback: VoidFunction): void {
            this._subscribedEventListeners.splice(this._subscribedEventListeners.findIndex((listener) => listener == callback), 1)
        }

        //Array overrides
        //The binding is required otherwise everything is thrown out of whack because higher-order nonsense
        override pop = notifyWrapper(super.pop.bind(this), this.notify.bind(this))
        override push = notifyWrapper(super.push.bind(this), this.notify.bind(this))
        override reverse = notifyWrapper(super.reverse.bind(this) as () => this, this.notify.bind(this)) //reverse does actually return `this`
        override shift = notifyWrapper(super.shift.bind(this), this.notify.bind(this))
        override sort = notifyWrapper(super.sort.bind(this), this.notify.bind(this))
        override splice = notifyWrapper(super.splice.bind(this), this.notify.bind(this))
        override unshift = notifyWrapper(super.unshift.bind(this), this.notify.bind(this))

        //Custom stuff
        replaceAll(items: T[]): this {
            super.splice(0, this.length)
            super.push(...items)
            this.notify() //We've done our item changes, so *now* we notify others that stuff has changed
            return this
        }

        constructor(...args: any[]) {
            super(...args)
            this._subscribedEventListeners = []
        }
    }
}