<script setup>
let props = defineProps({
  dialog: Boolean,
})
let emit = defineEmits(['update:dialog'])
function closeDialog() {
  emit('update:dialog', false)
}
const playlistVideos = ref([])
const playlistFiles = ref([])
const videoPath = ref('')
async function loadPlaylists() {
  videoPath.value = await settingsStore.get('videoFilePath')
  await getPlaylistFiles()
  if (playlistFiles.value.length > 0) {
    getPlaylistVideos(playlistFiles.value[0])
  }
}
import { computed, defineComponent, ref, watch } from 'vue'
import { useVideoList } from '/@/stores/videoList'
import { useSettings } from '/@/stores/settings'
const settingsStore = useSettings()
import { useFormatting } from '/@/composables/formatting'
// const { getMbpsIconColor, sizeFormat } = useFormatting()
const videoStore = useVideoList()
async function deleteVideo(path) {
  try {
    await window.videos_bridge.deleteVideo(path)
    let i = playlistVideos.value.findIndex((x) => x.filePath == path)
    playlistVideos.value.splice(i, 1)
    videoStore.removeVideo(path)
  } catch (err) {}
  return
}
async function deleteSelected() {
  for (let video of playlistVideos.value) {
    if (video.checked) {
      await deleteVideo(video.filePath)
    }
  }
  return
}
async function deletePlaylist(fileName) {
  try {
    let saveDir = await settingsStore.get('saveDirectory')
    await window.playlist_bridge.deletePlaylist(saveDir + '\\' + fileName)
    let i = playlistFiles.value.findIndex((x) => x == fileName)
    playlistFiles.value.splice(i, 1)
  } catch (err) {}
}
//get playlist files
async function getPlaylistFiles(fileName) {
  let saveDir = await settingsStore.get('saveDirectory')
  let files = await window.playlist_bridge.loadPlaylists(saveDir)
  playlistFiles.value = files
  return files
}
//get playlist videos
async function getPlaylistVideos(fileName) {
  let saveDir = await settingsStore.get('saveDirectory')
  playlistVideos.value = await window.playlist_bridge.getPlaylistList(
    saveDir + '\\' + fileName,
  )
}
function removeVideoPath(path) {
  return path.replace(videoPath.value, '')
}
loadPlaylists()
</script>
<template>
  <!-- <span> -->
  <div class="text-xl font-bold">Playlist Videos</div>
  <div class="grid md:grid-cols-4 gap-6 overflow-y-auto">
    <div class="md:col-span-3">
      <div class="flex flex-col">
        <span
          class="flex flex-row justify-between"
          v-for="video in playlistVideos"
        >
          <span class="overflow-hidden h-5">
            <input
              type="checkbox"
              class="mr-1 accent-slate-700"
              v-model="video.checked"
            />
            <span class="">
              {{ removeVideoPath(video.filePath) }}
            </span>
          </span>
          <span
            class="ml-1 mdi mdi-trash-can cursor-pointer"
            @click="deleteVideo(video.filePath)"
          ></span>
        </span>
      </div>
    </div>
    <div class="md:col-span-1">
      <div
        class="flex justify-between flex-row"
        v-for="playlist in playlistFiles"
      >
        <span class="overflow-hidden h-5" @click="getPlaylistVideos(playlist)">
          {{ playlist }}
        </span>
        <span
          class="mdi mdi-trash-can"
          @click="deletePlaylist(playlist)"
        ></span>
      </div>
    </div>
  </div>
  <div>
    <button
      @click="deleteSelected"
      class="btn bg-slate-500 border border-slate-900 m-1 hover:bg-slate-700"
    >
      delete selected
    </button>
    <button
      @click="closeDialog"
      class="btn bg-slate-500 border border-slate-900 m-1 hover:bg-slate-700"
    >
      close
    </button>
  </div>
  <!-- </span> -->
</template>
<style scoped></style>
