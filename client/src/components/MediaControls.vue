<script setup lang="ts">
import SpeakerIcon from './icons/IconSpeaker.vue'
import { ref } from 'vue'

const player = new Audio()
const id = ref(1)
const title = ref(null)
const artist = ref(null)

function changeTrack(id: number) {
    player.src = '/api/media/tracks/' + id.toString() + '/file'
    fetch('/api/media/tracks/' + id.toString()).then(res => {
        res.json().then(json => {
            title.value = json.title
            artist.value = json.artist
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
            <img id="album-art" src="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fupload.wikimedia.org%2Fwikipedia%2Fcommons%2F2%2F27%2FSquare%252C_Inc_-_Square_Logo.jpg&f=1&nofb=1&ipt=9f4f62c2b481e3e7281da4b9233731a34f38b577b6df3cea1f2d3ebbe0e9e2db&ipo=images" alt="Album Art">
            <div class="vbox" id="track-info">
                <div style="font-weight: bold">{{title}}</div>
                <div>{{artist}}</div>
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
