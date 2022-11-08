<script setup lang="ts">
import SpeakerIcon from './icons/IconSpeaker.vue'
import { ref } from 'vue'

const player = new Audio()
const id = ref(1)
const track = ref({} as any)

function changeTrack(id: number) {
    player.src = '/api/media/tracks/' + id + '/file'
    fetch('/api/media/tracks/' + id).then(res => {
        res.json().then(json => {
            track.value = json
        })
    })
}

changeTrack(id.value)

function play() {
    if (player.paused) player.play()
    else player.pause()
}
</script>

<template>
    <div class="audio-controls">
        <div class="hbox margin">
            <img id="album-art" v-bind:src="'/api/media/tracks/' + id + '/art'" alt="Album Art">
            <div class="vbox" id="track-info">
                <div style="font-weight: bold">{{track.title}}</div>
                <div>{{track.artist}}</div>
            </div>
        </div>
        <div class="vbox margin">
            <input type="range" id="seekBar"/>
            <div class="hbox" id="playback-buttons">
                <button @click="changeTrack(--id)">PREV</button>
                <button @click="play">PLAY</button>
                <button @click="changeTrack(++id)">NEXT</button>
            </div>
        </div>
        <div class="hbox-reverse margin">
            <input class = "flex-item" type="range"/>
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
