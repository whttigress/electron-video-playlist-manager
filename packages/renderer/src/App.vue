<template>
  <div>
    <div
      class="
        title-bar
        text-white
        bg-zinc-900
        sticky
        top-0
        p-1
        left-0
        right-0
        h-8
        flex
        justify-between
      "
    >
      <span class="ml-3 z-10">Video & Playlist Manager</span>
      <span class="flex gap-2 title-bar-buttons">
        <button @click="toggleDevTools">
          <span class="mdi mdi-xml"></span>
        </button>
        <button @click="minimize">
          <span class="mdi mdi-window-minimize"></span>
        </button>
        <button @click="maximize">
          <span class="mdi mdi-window-maximize"></span>
        </button>
        <button @click="exit">
          <span class="mdi mdi-window-close"></span>
        </button>
      </span>
    </div>
    <!-- <app-navigation /> -->
    <router-view />
  </div>
</template>

<script>
import { defineComponent } from 'vue'
import AppNavigation from '/@/components/AppNavigation.vue'
export default defineComponent({
  name: 'App',
  components: {
    AppNavigation,
  },
  methods: {
    exit() {
      window.app_bridge.exit()
    },
    minimize() {
      window.app_bridge.minimize()
    },
    maximize() {
      window.app_bridge.maximize()
    },
    toggleDevTools() {
      window.app_bridge.toggleDevTools()
    },
  },
})
</script>

<style>
body {
  background-color: #222;
}
.title-bar {
  -webkit-app-region: drag;
}
.title-bar-buttons {
  -webkit-app-region: no-drag;
}
</style>
