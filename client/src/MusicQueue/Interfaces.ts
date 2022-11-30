import { trackSlotScopes } from "@vue/compiler-core"
import type { Socket } from "socket.io-client"
import type { Ref } from "vue"
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

export const defaultTrack: ITrack = {
    id: -1,
    title: "Unknown Track",
    artist: "Unknown Artist",
    album: {
        title: "Unknown Album"
    }
}

export interface IMusicQueue {
    readonly currentTrack: ITrack

    shuffle: boolean

    peek(): ITrack
    next(): ITrack
    previous(): ITrack
    add(track: ITrack): void
    remove(track: ITrack): void
    select(track: ITrack): void
}

export interface IObservableMusicQueue extends IMusicQueue {
    onnext(): void
    onprevious(): void
}