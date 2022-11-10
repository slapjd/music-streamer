<script setup lang="ts">
import { ref } from 'vue';
import MediaControls from './components/MediaControls.vue'
import MediaSelect from './components/MediaSelect.vue'
import { LocalMusicQueue } from './components/MusicQueue';

const queue = ref(new LocalMusicQueue())
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
