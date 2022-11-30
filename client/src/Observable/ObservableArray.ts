import type { ITrack } from "@/MusicQueue/Interfaces";
import { functionComposer, type Arrayable, type GConstructor } from "@/MixinHelper/MixinHelper";
import { EventDispatcher, type Handler } from "@/EventHelper/EventHelper";

export class ObservableArray<T> extends Array<T> {
    private _eventDispatcher: EventDispatcher<void> = new EventDispatcher() //It's easier to init this here
    onArrayChanged(handler: Handler<void>) {
        this._eventDispatcher.register(handler)
    }

    //Array overrides
    //The binding is required otherwise everything is thrown out of whack because higher-order nonsense
    override pop = functionComposer(super.pop.bind(this), this._eventDispatcher.fire.bind(this._eventDispatcher))
    override push = functionComposer(super.push.bind(this), this._eventDispatcher.fire.bind(this._eventDispatcher))
    override reverse = functionComposer(super.reverse.bind(this), this._eventDispatcher.fire.bind(this._eventDispatcher)) //reverse does actually return `this`
    override shift = functionComposer(super.shift.bind(this), this._eventDispatcher.fire.bind(this._eventDispatcher))
    override sort = functionComposer(super.sort.bind(this), this._eventDispatcher.fire.bind(this._eventDispatcher))
    override splice = functionComposer(super.splice.bind(this), this._eventDispatcher.fire.bind(this._eventDispatcher))
    override unshift = functionComposer(super.unshift.bind(this), this._eventDispatcher.fire.bind(this._eventDispatcher))

    //Custom stuff
    replaceAll(items: T[]): this {
        super.splice(0, this.length)
        super.push(...items)
        this._eventDispatcher.fire() //We've done our item changes, so *now* we notify others that stuff has changed
        return this
    }
}

const test = new ObservableArray<number>()