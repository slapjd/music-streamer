import { ObservableStateManager, notifyWrapper } from "./ObservableStateManager";
import type { IObservable } from "./IObservable";

//TODO: avoid reimplementing BaseObservable if at all possible (while also not reimplementing most of Array)
export class ObservableList<T> extends Array<T> implements IObservable{
    private _observableStateManager: ObservableStateManager = new ObservableStateManager() //Initialized here so we can use it in our declarations

    notify = this._observableStateManager.notify
    subscribe = this._observableStateManager.subscribe
    unsubscribe = this._observableStateManager.unsubscribe

    //Array overrides
    //The binding is required otherwise everything is thrown out of whack because higher-order nonsense
    override pop = notifyWrapper(super.pop.bind(this), this.notify.bind(this))
    override push = notifyWrapper(super.push.bind(this), this.notify.bind(this))
    override reverse(): this {
        //Not using notifywrapper because it returns a reference to itself
        //And i'm not sure that works with the wrapper (it *might* return some wacky superclass)
        super.reverse()
        this.notify()
        return this
    }
    override shift = notifyWrapper(super.shift.bind(this), this.notify.bind(this))
    override sort(compareFn?: ((a: T, b: T) => number) | undefined): this {
        //See reverse()'s comment
        super.sort(compareFn)
        this.notify()
        return this
    }
    override splice = notifyWrapper(super.splice.bind(this), this.notify.bind(this))
    override unshift = notifyWrapper(super.unshift.bind(this), this.notify.bind(this))


    //Custom stuff
    replaceAll(items: T[]): this {
        super.splice(0, this.length)
        super.push(...items)
        this.notify() //We've done our item changes, so *now* we notify others that stuff has changed
        return this
    }
}