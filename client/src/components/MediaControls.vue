<script setup lang="ts">
import SpeakerIcon from './icons/IconSpeaker.vue'
import type { MusicQueue } from './MusicQueue'
import { ref } from 'vue'

const props = defineProps<{
    queue: MusicQueue
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

function play() {
    if (player.paused) player.play()
    else player.pause()
}

props.queue.onchange = () => {
    let forcePlay = !player.paused
    player.src = '/api/media/tracks/' + props.queue.currentTrack.id + '/file'
    if (forcePlay) player.play()
}
</script>

<template>
    <div class="audio-controls">
        <div class="hbox margin clickable">
            <img id="album-art" :src="queue.currentTrack.id ? '/api/media/tracks/' + queue.currentTrack.id + '/art' : '../assets/logo.svg'" alt="Album Art">
            <div class="vbox" id="track-info">
                <!--We do a little trolling to let vue look at currentTrack properly-->
                <div style="font-weight: bold">{{queue.currentTrack.title || "Unknown Title"}}</div>
                <div>{{queue.currentTrack.artist || "Unknown Artist"}}</div>
            </div>
        </div>
        <div class="vbox margin">
            <input type="range"
            min="0" :max="maxTime" step=0.001 v-model="currentTime"
            @change="player.currentTime = currentTime"
            @mousedown="seekUpdates = false"
            @touchstart="seekUpdates = false"
            @mouseup="seekUpdates = true"
            @touchend="seekUpdates = true"/>
            <div class="hbox" id="playback-buttons">
                <button @click="queue.previous()">PREV</button>
                <button @click="play">PLAY</button>
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
