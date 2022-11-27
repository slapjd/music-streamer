<script setup lang="ts">
import { ref } from 'vue';
import MediaControls from './components/MediaControls.vue'
import MediaSelect from './components/MediaSelect.vue'
import { LocalMusicQueue } from './MusicQueue/LocalMusicQueue';
import { RemoteMusicQueue } from './MusicQueue/RemoteMusicQueue';
import type { IObservableMusicQueue } from './MusicQueue/IMusicQueue';
import io from 'socket.io-client'

const socket = io({
  path: '/api/socket.io' //socketio is kinda wack because our api is behind a proxy but vite also wants websocket access
})
//socket.connect()

socket.onAny((event, args) => {
  console.debug(event)
  console.table(args)
})

const queue = ref()

socket.on("becomeHost", () => {
  queue.value = new LocalMusicQueue(socket)
})

socket.on("becomeRemote", () => {
  queue.value = new RemoteMusicQueue(socket)
})

</script>

<template>
  <div class="vbox" id="main">
    <MediaSelect :queue="queue" class="filler"/>
    <div class="hbox">
      <button id="buttonLogin">LOGIN</button>
      <button id="buttonLogout">LOGOUT</button>
    </div>
    <MediaControls :queue="queue" id="test"/>
  </div>
</template>

<style scoped>
#main {
  height: 100%
}
</style>
