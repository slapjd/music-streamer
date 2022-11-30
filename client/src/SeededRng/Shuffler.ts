import type { SeededRng } from "@/SeededRng/SeededRng";

export class Shuffler<T> {
    protected readonly _rng: SeededRng
    protected _items: T[]
    protected _blacklistedItems: T[]

    protected get _filteredItems(): T[] {
        var output = this._items.filter((item) => !this._blacklistedItems.includes(item))
        if (output.length < 1) {
            if (this._blacklistedItems.length > 1) {
                this._blacklistedItems.splice(0, this._blacklistedItems.length - 1) //Delete all except last
                output = this._items.filter((item) => !this._blacklistedItems.includes(item))
            } else {
                output = [...this._items]
            }
        }
        return output
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

        //TODO: Decide on whether i want next() to update the filtered list on its own
        this.update(output)

        return output
    }

    update(item: T) {
        if (!this._blacklistedItems.includes(item)) {
            this._blacklistedItems.push(item)
        }
    }

    updateItemsReference(items: T[]) {
        this._items = items
    }

    constructor(items: T[], rng: SeededRng) {
        this._rng = rng
        this._items = items
        this._blacklistedItems = []
    }
}