<script setup>
import { copyText } from 'vue3-clipboard'
import { reactive, computed, ref } from 'vue'
import dayjs from 'dayjs'
import { useFormatting } from '/@/composables/formatting'
const { getVideoUrlIcon, getMbpsIconColor, sizeFormat } = useFormatting()
var props = defineProps({
  video: Object,
})

var mbps = computed(() => {
  return props.video.duration.seconds
    ? (
        props.video.stat.size /
        1024 /
        1024 /
        props.video.duration.seconds
      ).toFixed(3)
    : null
})
const mbpsColor = computed(() => {
  return getMbpsIconColor(mbps.value)
})
function copyLink(link) {
  /* eslint-disable no-console */
  console.info(link)
  copyText(link)
}
function openExternal(url) {
  window.shell_bridge.openExternal(url)
}
const videoIcon = computed(() => {
  var url = props.video.link || ''
  if (url) {
    return getVideoUrlIcon(url)
  }
})

var imgSrc = ref(null)
async function loadFile(path) {
  let img = await window.videos_bridge.getImage(path)
  imgSrc.value = img
}
if (props.video.fileThumbnail) {
  loadFile(props.video.fileThumbnail)
}
</script>
<template>
  <div class="flex">
    <img
      v-if="imgSrc"
      height="60"
      width="100"
      class="pr-2 object-cover"
      :src="'data:image/jpeg;base64,' + imgSrc"
    />
    <div class="overflow-hidden">
      <span class="text-sm">
        {{ video.trimmedName }}
      </span>
      <div class="h-6">
        <span
          v-if="mbpsColor"
          class="group mdi mdi-circle"
          :class="`${mbpsColor}`"
          ><span class="relative">
            <span
              class="
                text-white text-xs
                absolute
                -left-5
                bg-slate-900
                px-2
                py-1
                rounded-md
                ml-10
                hidden
                w-20
                group-hover:inline-block
              "
              >{{ mbps }} Mbps</span
            >
          </span>
        </span>
        <span
          v-if="video.link"
          @click.stop="openExternal(video.link)"
          class="mdi cursor-pointer text-lg text-clip"
          :class="`${videoIcon.color} ${videoIcon.icon}`"
        ></span
        ><span class="text-xs">
          <span v-if="video.episode && !Array.isArray(video.episode)">
            Ep {{ video.episode }}
          </span>
          <span v-else-if="video.fixedepisode">
            Ep {{ video.fixedepisode }}
          </span>
          <span> - {{ video.duration.duration }}</span>
          <span>
            <span v-if="mbps"> - {{ mbps }} Mbps - </span>
            {{ sizeFormat(video.stat.size) }} -
            <span v-if="video.info && video.info.upload_date">
              {{ dayjs(video.info.upload_date).format('MM/DD/YYYY') }}
            </span>
            <span v-else-if="video.info && video.info.epoch">
              {{ new Date(video.info.epoch * 1000).toLocaleString() }}
            </span>
            <span v-else>
              {{ dayjs(video.stat.birthtime).format('MM/DD/YYYY') }}
            </span>
          </span></span
        >
      </div>
    </div>
  </div>
</template>
<style scoped></style>
