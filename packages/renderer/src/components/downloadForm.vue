<script setup>
import { computed, defineComponent, ref, watch } from 'vue'
import { useSettings } from '/@/stores/settings'
let props = defineProps({
  dialog: Boolean,
})
let emit = defineEmits(['update:dialog'])
function closeDialog() {
  emit('update:dialog', false)
}
const settingsStore = useSettings()
const downloadUrl = ref('')
const isDownloading = ref(false)
const response = ref(``)
function processResponse(data) {
  if (data == '--closed--') {
    isDownloading.value = false
  }
  if (!data.endsWith('\n')) {
    data += '\n'
  }
  response.value += data
  scrollToBottom()
  console.log(data)
}
const responseContainer = ref(null)
function scrollToBottom() {
  const container = responseContainer.value
  if (container) {
    container.scrollTop = container.scrollHeight
  }
}
function downloadVideo() {
  isDownloading.value = true
  window.youtube_bridge.downloadVideo(downloadUrl.value)
}
window.youtube_bridge.onDownloadResponse(processResponse)
async function openYtdlpFolder() {
  let ytdlp = await settingsStore.get('ytdlpExePath')
  let fileIndex = ytdlp.lastIndexOf('\\')
  let path = ytdlp.substr(0, fileIndex)
  window.shell_bridge.openPath(path)
}
</script>
<template>
  <!-- <span class=""> -->
  <div class="text-xl font-bold">Downloader</div>
  <div class="">
    <div class="flex flex-col sm:flex-row">
      <label for="videoFilePath" class="form-label w-full sm:w-1/3"
        >Video Url</label
      >
      <div class="w-full sm:w-2/3 flex">
        <input
          v-model="downloadUrl"
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
          type="button"
          @click="downloadVideo"
          :disabled="isDownloading || !downloadUrl"
          class="
            disabled:opacity-50
            disabled:hover:bg-slate-500
            disabled:cursor-default
            btn
            bg-slate-500
            border border-slate-900
            m-1
            hover:bg-slate-700
          "
        >
          Download
        </button>
      </div>
    </div>
  </div>
  <div ref="responseContainer" class="relative overflow-y-auto">
    <div>
      <pre class="whitespace-pre-wrap">{{ response }}</pre>
    </div>
  </div>
  <div class="">
    <button
      @click="closeDialog"
      class="btn bg-slate-500 border border-slate-900 m-1 hover:bg-slate-700"
    >
      close
    </button>
    <button
      @click="openYtdlpFolder"
      class="btn bg-slate-500 border border-slate-900 m-1 hover:bg-slate-700"
    >
      open yt-dlp folder
    </button>
  </div>
  <!-- </span> -->
</template>
<style scoped></style>
