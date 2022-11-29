import { BaseObservable } from "./BaseObservable";
import type { IObservable } from "./IObservable";

//TODO: avoid reimplementing BaseObservable if at all possible (while also not reimplementing most of Array)
export class ObservableList<T> extends Array<T> implements IObservable{
    private _subscribedEventListeners: VoidFunction[]

    constructor() {
        super()
        this._subscribedEventListeners = []
    }

    notifyWrapper<F extends (...args: any[]) => any>(fn: F) {
        return (...args: Parameters<F>): ReturnType<F> => {
            // console.log("FUNC_PASSED:", fn)
            // console.log("SUPER_FUNC:", super.push)
            // console.log("FUNCS_EQUAL:", fn == super.push)
            // console.log("ARGS_ARRAY:", args)
            // console.log("ARGS_SPREAD:", ...args)
            // console.log("TEST_ARRAY:", [...args])
            // console.log("FUNC_IS_UNDEFINED:", fn == null)
            //NOTE: HIGHER ORDER FUNCTIONS ARE WHACK IN JS AND CAN SOMETIMES LOSE THEIR REFERENCE OF `this` AND `super`
            //IF YOU PASS ANY FUNCTIONS TO THIS THAT ARE DIRECT REFERENCES TO THOSE: E.G. PASSING `super.push`,
            //YOU MUST BIND THEM TO `this` (OR MAYBE `super`). E.G: `push = this.notifyWrapper(super.push.bind(this))
            //THIS TOOK MANY HOURS TO FIGURE OUT
            const output = fn(...args)
            this.notify()
            return output
        }
    }

    
    //Observable requirements
    notify(): void {
        this._subscribedEventListeners.forEach((callback) => {
            if (callback) callback()
        })
    }

    subscribe(callback: VoidFunction) {
        this._subscribedEventListeners.push(callback)
    }

    unsubscribe(callback: VoidFunction): void {
        this._subscribedEventListeners.splice(this._subscribedEventListeners.findIndex((listener) => listener == callback), 1)
    }


    //Array overrides
    //The binding is required otherwise everything is thrown out of whack because higher-order nonsense
    override pop = this.notifyWrapper(super.pop.bind(this))
    override push = this.notifyWrapper(super.push.bind(this))
    override reverse(): this {
        //Not using notifywrapper because it returns a reference to itself
        //And i'm not sure that works with the wrapper (it *might* return some wacky superclass)
        super.reverse()
        this.notify()
        return this
    }
    override shift = this.notifyWrapper(super.shift.bind(this))
    override sort(compareFn?: ((a: T, b: T) => number) | undefined): this {
        //See reverse()'s comment
        super.sort(compareFn)
        this.notify()
        return this
    }
    override splice = this.notifyWrapper(super.splice.bind(this))
    override unshift = this.notifyWrapper(super.unshift.bind(this))


    //Custom stuff
    replaceAll(items: T[]): this {
        super.splice(0, this.length)
        super.push(...items)
        this.notify() //We've done our item changes, so *now* we notify others that stuff has changed
        return this
    }
}