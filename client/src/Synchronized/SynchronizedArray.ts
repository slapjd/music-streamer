import type { Arrayable } from "@/MixinHelp/MixinHelp";
import type { ITrack } from "@/MusicQueue/Interfaces";
import type { Socket } from "socket.io-client";

export function SynchronizedArrayMixin<T, TBase extends Arrayable<T>>(Base: TBase) {
    return class SynchronizedArray extends (Base as Arrayable<T>) {
        //Base is casted to Arrayable so that the constructor's signature is modifiable

        private readonly _socket: Socket

        override pop = super.pop

        constructor(socket: Socket, ...args: any[]) {
            super(...args)
            this._socket = socket
        }
    }
}
