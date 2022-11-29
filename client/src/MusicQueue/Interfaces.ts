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
    currentTrack: ITrack
    trackList: ITrack[]
    shuffle: boolean
    readonly preview: ITrack
    readonly remote: boolean

    playbackComplete(): void //Called by audio player on finishing playback
    next(): void
    previous(): void
    add(_: ITrack): void
    remove(_: ITrack): void
    select(_: ITrack): void
}