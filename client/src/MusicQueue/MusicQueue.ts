import type { IMusicQueue, ITrack } from "./Interfaces";
import { defaultTrack } from "./Interfaces";
import { Shuffler } from "@/SeededRng/Shuffler";
import { SeededRng } from "@/SeededRng/SeededRng";
import { ObservableArray } from "@/Observable/ObservableArray";

/**
 * Music queue with shuffle support
 */
export class MusicQueue implements IMusicQueue {
    private _currentTrack: ITrack;

    protected _rng: SeededRng
    protected _trackShuffler: Shuffler<ITrack>
    protected _nextStack: ITrack[]
    protected _previousStack: ITrack[]
    protected readonly _tracks: ObservableArray<ITrack> //Observable is a secret tool that'll help us later

    protected get _previousIgnoreStack(): ITrack {
        if (this._tracks.length < 1) return defaultTrack //previousStack takes priority over valid tracks (although it shouldn't ever have a track that isn't in tracks)
        else if (this.shuffle) return this._trackShuffler.peek()
        else return this._tracks[(this._findTrackIndex(this.currentTrack) + this._tracks.length - 1) % this._tracks.length]
    }

    protected get _nextIgnoreStack(): ITrack {
        if (this._tracks.length < 1) return defaultTrack //nextStack takes priority over valid tracks (although it shouldn't ever have a track that isn't in tracks)
        else if (this.shuffle) return this._trackShuffler.peek()
        else return this._tracks[(this._findTrackIndex(this.currentTrack) + 1) % this._tracks.length]
    }


    protected _findTrackIndex(trackToFind: ITrack) : number {
        return (this._tracks as ITrack[]).findIndex(track => track.id == trackToFind.id)
    }

    /**
     * Currently selected track
     */
    get currentTrack() : ITrack {
        return this._currentTrack
    }
    protected set currentTrack(value: ITrack) {
        this._currentTrack = value
        this._trackShuffler.update(value)
    }
    shuffle: boolean;

    /**
     * Looks at the next track without actually selecting it.
     * Useful for "up next"-type scenarios
     * @returns Next track to be played
     */
    peek(): ITrack {
        if (this._nextStack.length > 0) return this._nextStack[this._nextStack.length - 1]
        else return this._nextIgnoreStack
    }
    /**
     * Selects the next track
     * @returns Next track to be played (which it has just selected)
     */
    next(): ITrack {
        this._previousStack.push(this.currentTrack)
        if (this._nextStack.length > 0) this.currentTrack = this._nextStack.pop()!
        else this.currentTrack = this._nextIgnoreStack
        return this.currentTrack
    }
    /**
     * Selects the previous track
     * @returns Previous track (which it has just selected)
     */
    previous(): ITrack {
        this._nextStack.push(this.currentTrack)
        if (this._previousStack.length > 0) this.select(this._previousStack.pop()!)
        else this.select(this._previousIgnoreStack)
        return this.currentTrack
    }
    /**
     * Adds a track to the queue
     * @param track Track to insert into the queue
     */
    add(track: ITrack): void {
        this._tracks.push(track)
    }
    /**
     * Removes a track from the queue
     * @param track Track to remove from the queue
     */
    remove(track: ITrack): void {
        this._tracks.splice(this._findTrackIndex(track), 1)
    }
    /**
     * Selects a track within the queue
     * @param track Track to select/play
     */
    select(track: ITrack): void {
        this.currentTrack = track
    }
    
    constructor() {
        this._rng = new SeededRng()
        this._tracks = new ObservableArray<ITrack>()
        this._trackShuffler = new Shuffler<ITrack>(this._tracks, this._rng) //_tracks is passed by reference and so shuffler will update automatically

        this._currentTrack = defaultTrack
        this.shuffle = false

        this._nextStack = []
        this._previousStack = []
    }
}