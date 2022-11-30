import type { MusicQueueable } from "@/MixinHelper/MixinHelper";
import { ObservableArrayMixin } from "@/Observable/ObservableArray";
import { Shuffler } from "@/SeededRng/Shuffler";
import type { Socket } from "socket.io-client";
import type { ITrack } from "./Interfaces";
import { MusicQueue } from "./MusicQueue";
import { EventDispatcher, type Handler } from "@/EventHelper/EventHelper"

interface ChangeTrackEvent {
    current: ITrack
    next: ITrack
    nextStack: ITrack[]
    previousStack: ITrack[]
}

interface QueueUpdateEvent {
    queue: ITrack[]
}

export class SynchronizedObservableMusicQueue extends MusicQueue {
    protected readonly _socket: Socket
    
    protected _changeTrackDispatcher: EventDispatcher<ChangeTrackEvent>
    onChangeTrack(handler: Handler<ChangeTrackEvent>) {
        this._changeTrackDispatcher.register(handler)
    }

    protected _queueUpdateDispatcher: EventDispatcher<QueueUpdateEvent>
    onQueueUpdate(handler: Handler<QueueUpdateEvent>) {
        this._queueUpdateDispatcher.register(handler)
    }

    override set currentTrack(value: ITrack) {
        super.currentTrack = value
        this._changeTrackDispatcher.fire({current: value, next: this.peek(), nextStack: this._nextStack, previousStack: this._previousStack})
        
    }

    constructor(socket: Socket) {
        super()
        //Init new stuff
        this._socket = socket
        this._changeTrackDispatcher = new EventDispatcher()
        this._queueUpdateDispatcher = new EventDispatcher()

        //fire queue update whenever _tracks changes
        this._tracks.subscribe(() => {
            this._queueUpdateDispatcher.fire({queue: this._tracks})
        })

        //Emit queueupdate whenever queue updates (unless this was done by a socket)
        const emitUpdateQueue: Handler<QueueUpdateEvent> = (({queue}: QueueUpdateEvent) => {
            this._socket.emit("queueUpdate", queue)
        }).bind(this)
        this.onQueueUpdate(emitUpdateQueue)
        this._socket.on("queueUpdate", ([queue]) => {
            this._queueUpdateDispatcher.unregister(emitUpdateQueue) //Prevent endless socket dick-measuring
            this._tracks.replaceAll(queue)
            this.onQueueUpdate(emitUpdateQueue)
        })

        //Emit changetrack whenever track changes (unless this was done by a socket)
        const emitChangeTrack: Handler<ChangeTrackEvent> = (({current, next, nextStack, previousStack}: ChangeTrackEvent) => {
            this._socket.emit("changeTrack", current, next, nextStack, previousStack)
        }).bind(this)
        this.onChangeTrack(emitChangeTrack)
        this._socket.on("changeTrack", ([track, next, nextStack, previousStack]) => {
            this._previousStack = previousStack
            this._nextStack = nextStack
            //If nextStack was sent, next should be identical to the top entry (and in fact, we will assume this)
            if (this._nextStack.length < 1) {
                //Empty next stack, use the generated next
                this._nextStack.push(next)
            } else if (this._nextStack[this._nextStack.length - 1] != next) {
                //Warning just in case (we will just ignore `next` though)
                console.warn("WARNING_RECEIVED_NEXT_NOT_EQUAL_TO_RECEIVED_NEXTSTACK_NEXT")
            }

            //Next shit done, now change the goddamn track
            this._changeTrackDispatcher.unregister(emitChangeTrack)
            this.currentTrack = track
            this.onChangeTrack(emitChangeTrack)
        })
    }
}

// export function SynchronizedMusicQueueMixin<TBase extends MusicQueueable>(Base: TBase) {
//     return class SynchronizedMusicQueue extends (Base as MusicQueueable) {
//         protected _socket: Socket

//         override set currentTrack(value: ITrack) {
//             super.currentTrack = value //invoke super's setter
//             this._socket.emit("changeTrack", this.currentTrack, this.peek())
//         }

//         override set tracks(value: ITrack[]) {
//             (this.tracks as ObservableTrackArray).replaceAll(value)
//         }

//         constructor(socket: Socket, ...args: any[]) {
//             super(...args)
//             this._socket = socket

//             this.tracks = new ObservableTrackArray();
//             const synchronizeTracks: () => void = (() => {
//                 this._socket.emit("queueUpdate", this.tracks)
//             }).bind(this);
//             (this.tracks as ObservableTrackArray).subscribe(synchronizeTracks)
//             this._socket.on("queueUpdate", ([tracks]) => {
//                 (this.tracks as ObservableTrackArray).unsubscribe(synchronizeTracks);
//                 (this.tracks as ObservableTrackArray).replaceAll(tracks);
//                 (this.tracks as ObservableTrackArray).subscribe(synchronizeTracks)
//             })
//             this._trackShuffler = new Shuffler(this.tracks, this._rng)
//         }
//     }
// }