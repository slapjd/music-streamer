<script setup lang="ts">
import { shallowRef } from 'vue';
import MediaControls from './components/MediaControls.vue'
import MediaSelect from './components/MediaSelect.vue'
import { SynchronizedObservableMusicQueue } from './MusicQueue/SynchronizedObservableMusicQueue';
import type { IMusicQueue } from './MusicQueue/Interfaces'
import io from 'socket.io-client'
import { SynchronizedAudioPlayer } from './CustomAudioPlayer/WebAPIAudioPlayer';

const socket = io({
  path: '/api/socket.io' //socketio is kinda wack because our api is behind a proxy but vite also wants websocket access
})
//socket.connect()

socket.onAny((event, args) => {
  console.debug(event)
  console.table(args)
})

const queue = shallowRef() //MusicQueue is observable so we don't need deep reactivity. We only need to know if we changed between local and remote

queue.value = new SynchronizedObservableMusicQueue(socket)
//TODO: custom player is what actually needs to be host-aware
const player = shallowRef()
player.value = new SynchronizedAudioPlayer(queue.value)
</script>

<template>
  <div class="vbox" id="main">
    <MediaSelect :queue="queue" class="filler"/>
    <div class="hbox">
      <button id="buttonLogin">LOGIN</button>
      <button id="buttonLogout">LOGOUT</button>
    </div>
    <MediaControls :queue="queue" :player="player" id="test"/>
  </div>
</template>

<style scoped>
#main {
  height: 100%
}
</style>
