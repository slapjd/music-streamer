import { trackSlotScopes } from "@vue/compiler-core"
//import io from 'socket.io-client'

//TODO: Put this shit in both here and api somehow
export interface IAlbum {
    title: string
}

export interface ITrack {
    id: number
    title: string
    artist: string
    album: IAlbum
}

export interface IMusicQueue {
    currentTrack: ITrack
    trackList: ITrack[]
    shuffle: boolean
    preview: ITrack

    onchange(): void //Should be called whenever the track changes to help audio players update states
    playbackComplete(): void //Should be implemented for audio player to call to do any actions required when playback is finished
    next(): ITrack
    previous(): ITrack
    add(_: ITrack): void
    remove(_: ITrack): void
    select(_: ITrack): void
}

// export class RemoteMusicQueue implements IMusicQueue {
//     private _socket = io('/')

//     private _currentTrack: ITrack = {
//         id: -1,
//         title: "",
//         artist: "",
//         album: {
//             title: ""
//         }
//     }
//     public get currentTrack() : ITrack {
//         return this._currentTrack
//     }
//     public set currentTrack(v : ITrack) {
//         throw new Error("Method not implemented")
//         //TODO: send appropriate socketio message
//     }
//     public trackList: ITrack[] = []
//     private _shuffle = false //Cached value. Updates when websocket says to
//     public get value() : boolean {
//         return this._shuffle
//     }
//     public set shuffle(v : boolean) {
//         throw new Error("Method not implemented")
//     }
//     private _preview = this._currentTrack
//     public get preview() : ITrack {
//         return this._preview
//     }
    

//     public onchange(): void {}
//     public playbackComplete(): void {} //Not our problem baybeee
//     public next(): ITrack {
//         throw new Error("Method not implemented.")
//     }
//     public previous(): ITrack {
//         throw new Error("Method not implemented.")
//     }
//     public add(_: ITrack): void {
//         throw new Error("Method not implemented.")
//     }
//     public remove(_: ITrack): void {
//         throw new Error("Method not implemented.")
//     }
//     public select(_: ITrack): void {
//         throw new Error("Method not implemented.")
//     }

//     constructor() {
//         this._socket.connect()
//         this._socket.on('track_changed', (track: ITrack, preview: ITrack) => {
//             this._currentTrack = track
//             this._preview = preview
//         })
//         this._socket.on('shuffle', (shuffle: boolean) => {
//             this._shuffle = shuffle
//         })
//     }
    
// }

export class LocalMusicQueue implements IMusicQueue{    
    private get currentTrackIndex() : number {
        return this.trackList.findIndex(track => track.id === this.currentTrack.id)
    }
    private shuffleSeed = new Date().getTime()
    private availableShuffleTracks: any[] = []
    private previousStack: any[] = []
    private nextStack: any[] = []

    private _currentTrack: ITrack = {
        id: -1,
        title: "",
        artist: "",
        album: {
            title: ""
        }
    }
    public get currentTrack() : ITrack {
        return this._currentTrack
    }
    public set currentTrack(v : ITrack) {
        this._currentTrack = v;

        //Shuffle magic (attempts not to repeat tracks too much)
        this.availableShuffleTracks = this.availableShuffleTracks.filter(track => !(track.id === this.currentTrack.id))
        if (this.availableShuffleTracks.length < 1) this.availableShuffleTracks = this.trackList.filter(track => !(track.id === this.currentTrack.id))
        this.shuffleSeed++

        this.onchange()
    }
    public trackList: ITrack[] = []
    public shuffle: boolean = false
    public get preview() : ITrack {
        if (this.nextStack.length > 0) return this.nextStack[this.nextStack.length - 1]
        else if (this.shuffle) return this.getNextShuffle()
        else {
            return this.trackList[(this.currentTrackIndex + 1) % this.trackList.length]
        }
    }
    

    //128-bit hash function
    private cyrb128(str: string): number[] {
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

    private getNextShuffle(): ITrack {
        return this.availableShuffleTracks[this.sfc32(this.cyrb128(this.shuffleSeed.toString())) % this.availableShuffleTracks.length]
    }

    public onchange(): void {}

    public playbackComplete(): void {
        this.next()
    }
    
    public next(): ITrack {
        this.previousStack.push(this.currentTrack)

        if (this.nextStack.length > 0) {
            this.currentTrack = this.nextStack.pop()
        }
        else if (this.shuffle) {
            this.currentTrack = this.getNextShuffle()
        } else {
            this.currentTrack = this.trackList[this.currentTrackIndex + 1 % this.trackList.length]
        }

        return this.currentTrack
    }

    public previous(): ITrack {
        this.nextStack.push(this.currentTrack)

        if (this.previousStack.length > 0) {
            this.currentTrack = this.previousStack.pop()
        } else if (this.shuffle) { //Actually the same as next ironically
            this.currentTrack = this.getNextShuffle()
        } else {
            this.currentTrack = this.trackList[((this.currentTrackIndex + this.trackList.length) - 1) % this.trackList.length]
        }

        return this.currentTrack
    }

    public add(track: ITrack): void {
        this.trackList.push(track)
        this.availableShuffleTracks.push(track) //Add new track as available to be shuffled in
    }

    public remove(track: ITrack): void {
        this.trackList = this.trackList.filter(existing_track => !(existing_track.id === track.id))
        this.availableShuffleTracks = this.availableShuffleTracks.filter(existing_track => !(existing_track.id === track.id))
        //TODO: removing current track from queue what do?
    }

    public select(track: ITrack): void {
        this.currentTrack = track //Set new track
    }
}