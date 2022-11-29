import type { ObservableList } from "@/Observable/ObservableArray";
import type { SeededRng } from "@/SeededRng/SeededRng";

export class Shuffler<T> {
    protected readonly _rng: SeededRng
    protected readonly items: T[]
    protected _filteredItems: T[]
    protected _lastItem?: T

    protected _reset(): void {
        this._filteredItems = this.items.filter((track) => track !== this._lastItem)
    }

    /**
     * Retrieves the next item picked by shuffling.
     * Does not modify internal state
     * @returns Next item
     */
    peek(): T {
        return this._filteredItems[this._rng.peek() % this._filteredItems.length]
    }

    /**
     * Retrieves the next item picked by shuffling.
     * Modifies internal state
     * @returns Next item
     */
    next(): T {
        const output = this._filteredItems[this._rng.next() % this._filteredItems.length]

        //Length <=1 means we just picked the last track so we need to reset the available tracks
        if (this._filteredItems.length <= 1) this._reset()
        else this._filteredItems = this._filteredItems.filter((track) => track !== output)
        
        this._lastItem = output

        return output
    }

    constructor(items: T[], rng: SeededRng) {
        this._rng = rng
        this.items = items
        this._filteredItems = [...items] //Actual copy
    }
}

export class ObservableAwareShuffler<T> extends Shuffler<T> {
    constructor(items: ObservableList<T>, rng: SeededRng) {
        super(items, rng)

        items.subscribe(this._reset.bind(this))
    }
}