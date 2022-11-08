<script setup lang="ts">
import SpeakerIcon from './icons/IconSpeaker.vue'
</script>

<template>
    <div class="audio-controls">
        <div class="hbox">
            <img id="album-art" src="https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fupload.wikimedia.org%2Fwikipedia%2Fcommons%2F2%2F27%2FSquare%252C_Inc_-_Square_Logo.jpg&f=1&nofb=1&ipt=9f4f62c2b481e3e7281da4b9233731a34f38b577b6df3cea1f2d3ebbe0e9e2db&ipo=images" alt="Album Art">
            <div class="vbox" id="track-info">
                <div id="title-text" style="font-weight: bold">TRACK_TITLE</div>
                <div id="artist-text">ARTIST_NAME</div>
            </div>
        </div>
        <div class="vbox margin">
            <input type="range" id="seekBar"/>
            <div class="hbox" id="playback-buttons">
                <button>PREV</button>
                <button>PLAY</button>
                <button>NEXT</button>
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
