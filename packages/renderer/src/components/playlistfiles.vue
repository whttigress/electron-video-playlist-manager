<script setup>
import { computed, defineComponent, ref, watch } from 'vue'
import { useSettings } from '/@/stores/settings'
const settingsStore = useSettings()
import { useFormatting } from '/@/composables/formatting'
const { getMbpsIconColor, sizeFormat } = useFormatting()
const playlistVideos = ref([])
const playlistFiles = ref([])

async function deleteVideo(path) {
  try {
    await window.videos_bridge.deleteVideo(path)
    let i = playlistVideos.value.findIndex((x) => x.filePath == path)
    playlistVideos.value.splice(i, 1)
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
function closeModal() {
  toggleModal.value = false
}
function removeVideoPath(path) {
  return path.replace(videoPath.value, '')
}
const videoPath = ref('')
const toggleModal = ref(false)
watch(toggleModal, async (nval) => {
  if (nval) {
    videoPath.value = await settingsStore.get('videoFilePath')
    let playlists = await getPlaylistFiles()
    if (playlists.length > 0) {
      getPlaylistVideos(playlists[0])
    }
  }
})
</script>
<template>
  <span @keyup.esc="closeModal">
    <button
      @click="toggleModal = !toggleModal"
      class="btn bg-slate-500 border border-slate-900 m-1 hover:bg-slate-700"
    >
      playlist videos
    </button>
    <transition
      enter-active-class="duration-500 "
      leave-active-class="duration-500"
      enter-from-class="opacity-0 "
      leave-to-class="opacity-0 "
      enter-to-class=""
      leave-from-class=""
    >
      <span v-if="toggleModal" class="static inset-0">
        <div class="absolute z-40 inset-0 opacity-50 bg-black"></div>
        <div
          class="
            fixed
            overflow-x-hidden overflow-y-auto
            inset-0
            flex
            justify-center
            items-center
            z-50
          "
          @click="closeModal"
        >
          <div @click.stop class="relative w-auto mx-6">
            <div
              class="
                bg-gray-500
                w-full
                rounded-lg
                shadow-xl
                border-2 border-gray-800
                p-2
              "
            >
              <div class="text-xl font-bold">Playlist Videos</div>
              <div class="grid lg:grid-cols-4 gap-6">
                <div class="lg:col-span-3">
                  <div class="flex flex-col">
                    <span
                      class="flex flex-row justify-between"
                      v-for="video in playlistVideos"
                    >
                      <span class="overflow-hidden h-5">
                        <input
                          type="checkbox"
                          class="mr-1"
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
                <div>
                  <div
                    class="flex justify-between"
                    v-for="playlist in playlistFiles"
                  >
                    <span @click="getPlaylistVideos(playlist)">
                      {{ playlist }}
                    </span>
                    <span
                      class="mdi mdi-trash-can"
                      @click="deletePlaylist(playlist)"
                    ></span>
                  </div>
                </div>
              </div>
              <button
                @click="deleteSelected"
                class="
                  btn
                  bg-slate-500
                  border border-slate-900
                  m-1
                  hover:bg-slate-700
                "
              >
                delete selected
              </button>
              <button
                @click="closeModal"
                class="
                  btn
                  bg-slate-500
                  border border-slate-900
                  m-1
                  hover:bg-slate-700
                "
              >
                close
              </button>
            </div>
          </div>
        </div>
      </span>
    </transition>
  </span>
</template>
<style scoped></style>
