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
}