<script setup>
import { computed, defineComponent, ref, watch } from 'vue'
import { useSettings } from '/@/stores/settings'
const settingsStore = useSettings()
function closeModal() {
  toggleModal.value = false
}
const toggleModal = ref(false)
// watch(toggleModal, async (nval) => {})
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
  container.scrollTop = container.scrollHeight
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
  <span @keyup.esc="closeModal">
    <button
      @click="toggleModal = !toggleModal"
      class="btn bg-slate-500 border border-slate-900 m-1 hover:bg-slate-700"
    >
      Download
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
          class="fixed overflow-hidden h-full inset-0 z-50"
          @click="closeModal"
        >
          <div
            class="
              relative
              w-auto
              h-screen
              flex
              items-center
              justify-center
              py-8
              mx-6
            "
          >
            <div
              @click.stop
              class="
                bg-gray-500
                w-full
                max-h-full
                rounded-lg
                shadow-xl
                border-2 border-gray-800
                p-4
                flex flex-col
                gap-2
              "
            >
              <div class="text-xl font-bold">Downloader</div>
              <div>
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
                      @click="downloadVideo"
                      :disabled="isDownloading || !downloadUrl"
                      class="
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
                <button
                  @click="openYtdlpFolder"
                  class="
                    btn
                    bg-slate-500
                    border border-slate-900
                    m-1
                    hover:bg-slate-700
                  "
                >
                  open yt-dlp folder
                </button>
              </div>
            </div>
          </div>
        </div>
      </span>
    </transition>
  </span>
</template>
<style scoped></style>
