<template>
  <div class="flex flex-col h-screen">
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
    <div class="scroll_enabled flex-1">
      <router-view />
    </div>
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
.scroll_enabled {
  overflow: scroll;
  /* height: 1000px; define your custom height */
}

.scroll_enabled::-webkit-scrollbar {
  width: 20px;
}
.scroll_enabled::-webkit-scrollbar-corner {
  background: rgba(0, 0, 0, 0);
}
.scroll_enabled::-webkit-scrollbar-thumb {
  background-color: #888;
  border-radius: 6px;
  border: 4px solid rgba(0, 0, 0, 0);
  background-clip: content-box;
  min-width: 32px;
  min-height: 32px;
}
.scroll_enabled::-webkit-scrollbar-track {
  background-color: rgba(0, 0, 0, 0);
}
</style>
