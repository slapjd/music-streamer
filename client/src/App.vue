<script setup lang="ts">
import { shallowRef } from 'vue';
import MediaControls from './components/MediaControls.vue'
import MediaSelect from './components/MediaSelect.vue'
import { LocalMusicQueue } from './MusicQueue/LocalMusicQueue';
import { RemoteMusicQueue } from './MusicQueue/RemoteMusicQueue';
import type { IObservableMusicQueue } from './MusicQueue/IObservableMusicQueue';
import io from 'socket.io-client'

const socket = io({
  path: '/api/socket.io' //socketio is kinda wack because our api is behind a proxy but vite also wants websocket access
})
//socket.connect()

socket.onAny((event, args) => {
  console.debug(event)
  console.table(args)
})

const queue = shallowRef() //MusicQueue is observable so we don't need deep reactivity. We only need to know if we changed between local and remote

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
    <MediaControls :queue="queue" :socket="socket" id="test"/>
  </div>
</template>

<style scoped>
#main {
  height: 100%
}
</style>
