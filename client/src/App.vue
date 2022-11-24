<script setup lang="ts">
import { ref } from 'vue';
import MediaControls from './components/MediaControls.vue'
import MediaSelect from './components/MediaSelect.vue'
import { LocalMusicQueue } from './components/MusicQueue';
import io from 'socket.io-client'

const queue = ref(new LocalMusicQueue())

console.debug("PRE_SOCKET")

const socket = io({
  path: '/api/socket.io'
})
//socket.connect()

console.debug("POST_SOCKET")

socket.onAny((event, args) => {
  console.debug(event)
  console.table(args)
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
