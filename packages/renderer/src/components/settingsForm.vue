<script setup>
import { computed, defineComponent, ref, watch } from 'vue'
import listManager from '/@/components/list-manager.vue'

import { useSettings } from '/@/stores/settings'
import { storeToRefs } from 'pinia'
const settingsStore = useSettings()
const { prefs } = storeToRefs(settingsStore)
let props = defineProps({
  dialog: Boolean,
})
let emit = defineEmits(['update:dialog'])
function closeDialog() {
  emit('update:dialog', false)
}
watch(
  () => props.dialog,
  async (nval) => {
    if (nval) {
      settingsStore.getPreferences()
    }
  },
)
async function getYtdlpFilePath() {
  let currentPath = prefs.value.ytdlpExePath
  let path = await window.settings_bridge.selectFile(currentPath)
  console.log(path)
  if (path.filePaths.length > 0) {
    prefs.value.ytdlpExePath = path.filePaths[0]
  }
}
async function getPlaylistName() {
  let saveDirectory = prefs.value.saveDirectory
  let playlistName = prefs.value.playlistName
  let currentPath = saveDirectory + playlistName
  console.log(currentPath)
  let path = await window.settings_bridge.selectFile(currentPath)
  console.log(path)
  if (path.filePaths.length > 0) {
    let fileIndex = path.filePaths[0].lastIndexOf('\\')
    let file = path.filePaths[0].substr(fileIndex + 1)
    prefs.value.playlistName = file
  }
}
async function getFolderPath(name) {
  let currentPath = prefs.value[name]
  let path = await window.settings_bridge.selectDirectory(currentPath)
  console.log(path)
  if (path.filePaths.length > 0) {
    prefs.value[name] = path.filePaths[0] + '\\'
  }
}
</script>
<template>
  <!-- <div class="overflow-hidden flex flex-col gap-2"> -->
  <div class="text-xl font-bold">Settings</div>
  <div class="relative overflow-y-auto">
    <div class="w-full">
      <div class="flex flex-col sm:flex-row">
        <label for="videoFilePath" class="form-label w-full sm:w-1/3"
          >Video File Path</label
        >
        <div class="w-full sm:w-2/3 flex">
          <input
            v-model="prefs.videoFilePath"
            type="text"
            class="
              flex-1
              appearance-none
              p-0
              bg-transparent
              focus:outline-none focus:ring-0 focus:shadow-none
              border-b border-white
            "
            id="videoFilePath"
          />
          <button
            @click="getFolderPath('videoFolderPath')"
            class="
              btn
              bg-slate-500
              border border-slate-900
              m-1
              hover:bg-slate-700
            "
          >
            select
          </button>
        </div>
      </div>
      <div class="flex flex-col sm:flex-row">
        <label for="saveDirectory" class="form-label w-full sm:w-1/3"
          >Playlist Save Directory</label
        >
        <div class="w-full sm:w-2/3 flex">
          <input
            v-model="prefs.saveDirectory"
            type="text"
            class="
              flex-1
              appearance-none
              p-0
              bg-transparent
              focus:outline-none focus:ring-0 focus:shadow-none
              border-b border-white
            "
            id="saveDirectory"
          />
          <button
            @click="getFolderPath('saveDirectory')"
            class="
              btn
              bg-slate-500
              border border-slate-900
              m-1
              hover:bg-slate-700
            "
          >
            select
          </button>
        </div>
      </div>
      <div class="flex flex-col sm:flex-row">
        <label for="playlistName" class="form-label w-full sm:w-1/3"
          >Playlist Name</label
        >
        <div class="w-full sm:w-2/3 flex">
          <input
            v-model="prefs.playlistName"
            type="text"
            class="
              flex-1
              appearance-none
              p-0
              bg-transparent
              focus:outline-none focus:ring-0 focus:shadow-none
              border-b border-white
            "
            id="playlistName"
          />
          <button
            @click="getPlaylistName()"
            class="
              btn
              bg-slate-500
              border border-slate-900
              m-1
              hover:bg-slate-700
            "
          >
            select
          </button>
        </div>
      </div>
      <div class="flex flex-col sm:flex-row">
        <label for="ytdlpExePath" class="form-label w-full sm:w-1/3"
          >yt-dlp Path</label
        >
        <div class="w-full sm:w-2/3 flex">
          <input
            v-model="prefs.ytdlpExePath"
            type="text"
            class="
              flex-1
              appearance-none
              p-0
              bg-transparent
              focus:outline-none focus:ring-0 focus:shadow-none
              border-b border-white
            "
            id="ytdlpExePath"
          />
          <button
            @click="getYtdlpFilePath()"
            class="
              btn
              bg-slate-500
              border border-slate-900
              m-1
              hover:bg-slate-700
            "
          >
            select
          </button>
        </div>
      </div>
      <div class="flex flex-col sm:flex-row">
        <label for="matchPercentage" class="form-label w-full sm:w-1/3"
          >Match Percentage</label
        >
        <div class="flex w-full sm:w-2/3">
          <input
            v-model="prefs.matchPercentage"
            type="range"
            class="
              flex-1
              appearance-none
              p-0
              mt-3
              mr-3
              h-1
              accent-slate-700
              bg-gray-200
              rounded-full
              m-1
              outline-none
              slider-thumb
              focus:outline-none focus:ring-0 focus:shadow-none
            "
            :max="1"
            :min="0"
            :step="0.01"
            id="matchPercentage"
          />
          <input
            v-model="prefs.matchPercentage"
            type="number"
            class="
              appearance-none
              p-0
              bg-transparent
              focus:outline-none focus:ring-0 focus:shadow-none
              border-b border-white
            "
            :max="1"
            :min="0"
            :step="0.01"
          />
        </div>
      </div>
    </div>
    <div class="flex flex-col sm:grid sm:grid-cols-2 md:grid-cols-3 gap-5">
      <listManager
        class="flex-1"
        title="Ignore Common Terms"
        :list="prefs.ignoreNames"
        @addItem="addToArray('ignoreNames', $event)"
        @delete="removeFromArray('ignoreNames', $event)"
      ></listManager>
      <listManager
        class="flex-1"
        title="Excluded Files and Folders"
        :list="prefs.exclusions"
        @addItem="addToArray('exclusions', $event)"
        @delete="removeFromArray('exclusions', $event)"
      ></listManager>
      <listManager
        class="flex-1"
        title="Allowed Video Extensions"
        :list="prefs.allowedExtensions"
        @addItem="addToArray('allowedExtensions', $event)"
        @delete="removeFromArray('allowedExtensions', $event)"
      ></listManager>
    </div>
  </div>
  <div class="">
    <button
      @click="closeDialog"
      class="btn bg-slate-500 border border-slate-900 m-1 hover:bg-slate-700"
    >
      close
    </button>
  </div>
  <!-- </div> -->
</template>
<style scoped></style>
