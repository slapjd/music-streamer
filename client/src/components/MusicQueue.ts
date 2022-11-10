import { trackSlotScopes } from "@vue/compiler-core"

//Helper queue for gapless playback
export class MusicQueue {    
    private playbackIndex: number = 0

    private shuffleSeed = new Date().getTime()
    private availableShuffleTracks: any[] = []
    private _shuffle: boolean = false

    private previousStack: any[] = []
    private nextStack: any[] = []

    private _currentTrack: any = {}
    public get currentTrack() : any {
        return this._currentTrack
    }
    public set currentTrack(v : any) {
        this._currentTrack = v;
        this.onchange()
    }
    
    


    public trackList: any[] = []
    public get shuffle() : boolean {
        return this._shuffle
    }
    public set shuffle(v : boolean) {
        if (this.shuffle === v) return
        this._shuffle = v;

        if (!v) {
            this.playbackIndex = this.trackList.findIndex(track => track.id === this.currentTrack.id) //Get correct queue position for non-shuffling
        }
    }
    

    //128-bit hash function
    private cyrb128(str: string) {
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
    private sfc32(seed: number[]): number {
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

    private initShuffle() {
        if (this.availableShuffleTracks.length === 0) {
            if (this.currentTrack === undefined) this.availableShuffleTracks = this.trackList
            else this.availableShuffleTracks = this.trackList.filter(track => !(track.id === this.currentTrack.id))
        }
    }

    private peekShuffle() {
        this.initShuffle() //Doesn't matter if we init shuffle here because it won't init in choose if we do
        return this.availableShuffleTracks[this.sfc32(this.cyrb128(this.shuffleSeed.toString())) % this.availableShuffleTracks.length]
    }

    private chooseShuffle() {
        //Prevent the same track appearing twice at the very least (when queue ends)
        this.initShuffle()
        
        this.currentTrack = this.availableShuffleTracks[Math.floor(this.sfc32(this.cyrb128((this.shuffleSeed++).toString())) * this.availableShuffleTracks.length)] //Select random track
        this.availableShuffleTracks = this.availableShuffleTracks.filter(track => !(track.id === this.currentTrack.id)) //Remove track from pool
        this.playbackIndex = this.trackList.findIndex(track => track.id === this.currentTrack.id) //Set correct position of queue in case shuffle is disabled
    }

    public onchange() {
    }

    public peek() {
        if (this.nextStack.length > 0) return this.nextStack[this.nextStack.length - 1]
        else if (this.shuffle) return this.peekShuffle()
        else {
            return this.trackList[(this.playbackIndex + 1) % this.trackList.length]
        }
    }
    
    public next() {
        this.previousStack.push(this.currentTrack)

        if (this.nextStack.length > 0) {
            this.currentTrack = this.nextStack.pop()
            this.availableShuffleTracks = [] //Using the cache fucks with the shuffle remembering system's uniqueness so we just reset it for when we next shuffle
        }
        else if (this.shuffle) {
            this.chooseShuffle()
        } else {
            this.playbackIndex = (this.playbackIndex + 1) % this.trackList.length
            this.currentTrack = this.trackList[this.playbackIndex]
            this.availableShuffleTracks = [] //Shuffle disabled and we've actually started playing a track, reset the shuffle exclusions
        }

        return this.currentTrack
    }

    public previous() {
        this.nextStack.push(this.currentTrack)

        if (this.previousStack.length > 0) {
            this.currentTrack = this.previousStack.pop()
            this.availableShuffleTracks = [] //Using the cache fucks with the shuffle remembering system's uniqueness so we just reset it for when we next shuffle
        } else if (this.shuffle) { //Actually the same as next ironically
            this.chooseShuffle()
        } else {
            this.playbackIndex = ((this.playbackIndex + this.trackList.length) - 1) % this.trackList.length
            this.currentTrack = this.trackList[this.playbackIndex]
            this.availableShuffleTracks = [] //Shuffle disabled and we've actually started playing a track, reset the shuffle exclusions
        }

        return this.currentTrack
    }

    public add(track: any) {
        this.trackList.push(track)
        this.availableShuffleTracks.push(track) //Add new track as available to be shuffled in
        //PlaybackIndex is guaranteed to still be fine
    }

    public remove(track: any) {
        let i = this.trackList.findIndex(existing_track => existing_track.id === track.id)
        if (this.playbackIndex > i) this.playbackIndex-- //Playback position needs moving because the thing it's referencing has moved backwards
        this.trackList = this.trackList.filter(existing_track => !(existing_track.id === track.id))
        this.availableShuffleTracks = this.availableShuffleTracks.filter(existing_track => !(existing_track.id === track.id))
        //TODO: removing current track from queue what do?
    }

    public select(track: any) {
        let i = this.trackList.findIndex(existing_track => existing_track.id === track.id)
        this.playbackIndex = i //Set playback index to this
        this.availableShuffleTracks = [] //New song selected, previous shuffle assumptions void
        this.currentTrack = track //Set new track
    }
}