<script setup lang="ts">
import type { Ref } from 'vue';
import { ref } from 'vue';
import type { IMusicQueue, ITrack } from '../MusicQueue/Interfaces

const props = defineProps<{
    queue: IMusicQueue
}>()
const searchText = ref("")
const searchResults = ref([] as any[])

enum MenuMode {
    Queue,
    Search
}

const mode: Ref<MenuMode> = ref(MenuMode.Queue)
const trackList: Ref<ITrack[]> = ref([])

function setMode(newMode: MenuMode) {
    mode.value = newMode
}

async function search(text: string) {
    searchResults.value = await fetch('/api/media/tracks?title=' + text).then(res => res.json())
    mode.value = MenuMode.Search
}

props.queue.subscribe(() => {
    trackList.value = props.queue.trackList
})
</script>

<template>
    <div class="hbox" id="main">
        <div class="vbox" id="mode-select">
            <input type="text" placeholder="Search" v-model="searchText" @keyup.enter="search(searchText)">
            <button @click="setMode(MenuMode.Queue)">QUEUE</button>
            <button @click="setMode(MenuMode.Search)">SEARCH</button>
            <div class="filler"></div>
            <button>SETTINGS</button>
        </div>
        <div class="vbox filler" v-if="mode === MenuMode.Queue" id="queue-select">
            <table>
                <tr>
                    <th>Title</th>
                    <th>Artist</th>
                    <th>Album</th>
                </tr>
                <tr class="clickable" v-for="track in trackList" @dblclick="queue.select(track)">
                    <td>{{track.title || "Unknown Title"}}</td>
                    <td>{{track.artist || "Unknown Artist"}}</td>
                    <td>{{track.album.title || "Unknown Album"}}</td>
                </tr>
            </table>
        </div>
        <div class="vbox filler" v-if="mode === MenuMode.Search" id="queue-select">
            <table>
                <tr>
                    <th>Title</th>
                    <th>Artist</th>
                    <th>Album</th>
                </tr>
                <tr class="clickable" v-for="result in searchResults" @dblclick="queue.add(result);queue.select(result)">
                    <td>{{result.title || "Unknown Title"}}</td>
                    <td>{{result.artist || "Unknown Artist"}}</td>
                    <td>{{result.album.title || "Unknown Album"}}</td>
                </tr>
            </table>
        </div>
    </div>
</template>

<style scoped>
#mode-select {
    width: 350px;
}

button {
    height: 50px;
}
</style>