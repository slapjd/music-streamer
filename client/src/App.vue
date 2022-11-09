<script setup lang="ts">
import MediaControls from './components/MediaControls.vue'
import { MusicQueue } from './components/MusicQueue';

const queue = new MusicQueue()
</script>

<template>
  <div class="vbox">
    <div class="hbox">
      <button id="buttonLogin">LOGIN</button>
      <button id="buttonLogout">LOGOUT</button>
    </div>
    <MediaControls :queue="queue"/>
  </div>
</template>

<style scoped>
</style>
