import type { IObservable } from "./IObservable";
import type { ITrack } from "@/MusicQueue/Interfaces";
import { functionComposer, type Arrayable, type GConstructor } from "@/MixinHelper/MixinHelper";

//WARNING: this only really exists as an example mixin at this point
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
        override pop = functionComposer(super.pop.bind(this), this.notify.bind(this))
        override push = functionComposer(super.push.bind(this), this.notify.bind(this))
        override reverse = functionComposer(super.reverse.bind(this), this.notify.bind(this)) //reverse does actually return `this`
        override shift = functionComposer(super.shift.bind(this), this.notify.bind(this))
        override sort = functionComposer(super.sort.bind(this), this.notify.bind(this))
        override splice = functionComposer(super.splice.bind(this), this.notify.bind(this))
        override unshift = functionComposer(super.unshift.bind(this), this.notify.bind(this))

        //Custom stuff
        replaceAllSilently(items: T[]): this {
            super.splice(0, this.length)
            super.push(...items)
            return this
        }
        replaceAll(items: T[]): this {
            this.replaceAllSilently(items)
            this.notify() //We've done our item changes, so *now* we notify others that stuff has changed
            return this
        }

        constructor(...args: any[]) {
            super(...args)
            this._subscribedEventListeners = []
        }
    }
}