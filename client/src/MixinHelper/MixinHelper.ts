import type { MusicQueue } from "@/MusicQueue/MusicQueue";

export type GConstructor<T = any> = new (...args: any[]) => T;
export type Arrayable<T> = GConstructor<Array<T>>
export type MusicQueueable = GConstructor<MusicQueue>

/**
 * Function that composes a function after another function
 * @param fn Main function to call (Result is returned from this)
 * @param synchronize Additional function to run after main function is done
 * @returns Combined function
 */
export function functionComposer<F extends (...args: any[]) => any>(fn: F, synchronize: VoidFunction) {
    return (...args: Parameters<F>): ReturnType<F> => {
        //NOTE: HIGHER ORDER FUNCTIONS ARE WHACK IN JS AND CAN SOMETIMES LOSE THEIR REFERENCE OF `this` AND `super`
        //IF YOU PASS ANY FUNCTIONS TO THIS THAT ARE DIRECT REFERENCES TO THOSE: E.G. PASSING `super.push`,
        //YOU MUST BIND THEM TO `this` (OR MAYBE `super`). E.G: `push = this.notifyWrapper(super.push.bind(this))
        //THIS TOOK MANY HOURS TO FIGURE OUT
        const output = fn(...args)
        synchronize()
        return output
    }
}