import type { IObservable } from "../Observable/IObservable";

export function notifyWrapper<F extends (...args: any[]) => any>(fn: F, notify: VoidFunction) {
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
        notify()
        return output
    }
}

export class BaseObservable implements IObservable {
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

    constructor() {
        this._subscribedEventListeners = []
    }
}