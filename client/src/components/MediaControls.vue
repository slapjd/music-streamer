<script setup lang="ts">
import SpeakerIcon from './icons/IconSpeaker.vue'
import type { IMusicQueue, ITrack } from '../MusicQueue/Interfaces'
import type { IObservable } from '@/Observable/IObservable'
import { ref, type Ref } from 'vue'
import { defaultTrack } from '../MusicQueue/Interfaces'
import type { Socket } from 'socket.io-client';

const props = defineProps<{
    queue: IMusicQueue & IObservable,
    socket: Socket
}>()

const player = new Audio()
const maxTime = ref(0)
const currentTime = ref(0)
const seekUpdates = ref(true)
player.ontimeupdate = _ =>  {
    if (seekUpdates.value) currentTime.value = player.currentTime
}
player.ondurationchange = _ => maxTime.value = player.duration
const volume = ref(50)
player.onvolumechange = _ => volume.value = player.volume

const currentTrack: Ref<ITrack> = ref(defaultTrack)

function seek(time: number) {
    player.currentTime = time
    if (props.queue.remote) props.socket.emit("seek", time)
    else props.socket.emit("seekHost", time)
}

function play() {
    if (props.queue.remote) props.socket.emit("play")
    else {
        player.play()
        props.socket.emit("playHost")
        props.socket.emit("seekHost", player.currentTime)
    }
}

function pause() {
    if (props.queue.remote) props.socket.emit("pause")
    else {
        player.pause()
        props.socket.emit("pauseHost")
        props.socket.emit("seekHost", player.currentTime)
    }
}

function togglePlay() {
    if (player.paused) play()
    else pause()
}

//TODO: Resubscribe on host change
props.queue.subscribe(() => {
    let forcePlay = !player.paused
    player.src = '/api/media/tracks/' + props.queue.currentTrack.id + '/file'
    if (forcePlay) player.play()

    currentTrack.value = props.queue.currentTrack
})

if (props.queue.remote) {
    props.socket.on("playHost", () => {
        //player.onload = player.play //Should be safe
        player.play()
    })
    props.socket.on("pauseHost", () => {
        //player.onload = player.pause
        player.pause()
    })
    props.socket.on("seekHost", ([time]) => {
        // player.onload = () => {
        //     currentTime.value = time
        //     player.currentTime = time
        // }
        currentTime.value = time
        player.currentTime = time
    })
    props.socket.emit("remotePlayerJoined")

    player.volume = 0
} else {
    props.socket.on("play", play)
    props.socket.on("pause", pause)
    props.socket.on("seek", ([time]) => {
        currentTime.value = time
        player.currentTime = time
        props.socket.emit("seekHost", time)
    })
    props.socket.on("remotePlayerJoined", () => {
        props.socket.emit("seekHost", player.currentTime)
        if (player.paused) props.socket.emit("pauseHost")
        else props.socket.emit("playHost")
    })
}
</script>

<template>
    <div class="audio-controls">
        <div class="hbox margin clickable">
            <img id="album-art" :src="currentTrack.id || currentTrack.id !== -1 ? '/api/media/tracks/' + currentTrack.id + '/art' : '/api/assets/logo.svg'" alt="Album Art">
            <div class="vbox" id="track-info">
                <!--We do a little trolling to let vue look at currentTrack properly-->
                <div style="font-weight: bold">{{currentTrack.title || "Unknown Title"}}</div>
                <div>{{currentTrack.artist || "Unknown Artist"}}</div>
            </div>
        </div>
        <div class="vbox margin">
            <input type="range"
            min="0" :max="maxTime" step=0.001 v-model="currentTime"
            @change="seek(currentTime)"
            @mousedown="seekUpdates = false"
            @touchstart="seekUpdates = false"
            @mouseup="seekUpdates = true"
            @touchend="seekUpdates = true"/>
            <div class="hbox" id="playback-buttons">
                <button @click="queue.previous()">PREV</button>
                <button @click="togglePlay">PLAY</button>
                <button @click="queue.next()">NEXT</button>
            </div>
        </div>
        <div class="hbox-reverse margin">
            <input type="range" min="0" max="1" step="0.01" v-model="volume" @input="player.volume = volume"/>
            <div class="vbox" id="volume-icon-container">
                <SpeakerIcon id="volume-icon"/>
            </div>
        </div>
    </div>
</template>

<style scoped>
.audio-controls {
    display: grid;
    grid-template-columns: 1fr 3fr 1fr;
}

#album-art {
    height: 100px;
}

#track-info {
    justify-content: center;
}

#playback-buttons {
    justify-content: center;
    height: 100%;
}

#volume-icon-container {
    justify-content: center;
}

#volume-icon {
    height: 32px
}
</style>
