//128-bit hash function
function cyrb128(str: string): number[] {
    let h1 = 1779033703, h2 = 3144134277,
        h3 = 1013904242, h4 = 2773480762;
    for (let i = 0, k; i < str.length; i++) {
        k = str.charCodeAt(i);
        h1 = h2 ^ Math.imul(h1 ^ k, 597399067);
        h2 = h3 ^ Math.imul(h2 ^ k, 2869860233);
        h3 = h4 ^ Math.imul(h3 ^ k, 951274213);
        h4 = h1 ^ Math.imul(h4 ^ k, 2716044179);
    }
    h1 = Math.imul(h3 ^ (h1 >>> 18), 597399067);
    h2 = Math.imul(h4 ^ (h2 >>> 22), 2869860233);
    h3 = Math.imul(h1 ^ (h3 >>> 17), 951274213);
    h4 = Math.imul(h2 ^ (h4 >>> 19), 2716044179);
    return [(h1^h2^h3^h4)>>>0, (h2^h1)>>>0, (h3^h1)>>>0, (h4^h1)>>>0];
}

//32-bit PRNG with 128-bit seed
function sfc32(seed: number[]): number {
    seed[0] >>>= 0; seed[1] >>>= 0; seed[2] >>>= 0; seed[3] >>>= 0; 
    var t = (seed[0] + seed[1]) | 0;
    seed[0] = seed[1] ^ seed[1] >>> 9;
    seed[1] = seed[2] + (seed[2] << 3) | 0;
    seed[2] = (seed[2] << 21 | seed[2] >>> 11);
    seed[3] = seed[3] + 1 | 0;
    t = t + seed[3] | 0;
    seed[2] = seed[2] + t | 0;
    return (t >>> 0) / 4294967296;
}

export class SeededRng {
    private _state: number

    peek(): number {
        return sfc32(cyrb128(this._state.toString()))
    }

    next(): number {
        const output = this.peek()
        this._state++
        return output
    }

    constructor(seed = Date.now()) {
        this._state = seed
    }
}

export default {cyrb128, sfc32, SeededRng}