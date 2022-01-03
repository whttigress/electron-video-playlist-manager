<script setup>
import series from '/@/components/series.vue'
import draggable from 'vuedraggable'
import { reactive, ref, computed } from 'vue'
import { useFormatting } from '/@/composables/formatting'
const {
  getVideoUrlIcon,
  getMbpsIconColor,
  formatSecondsToTimeString,
  sizeFormat,
} = useFormatting()

var props = defineProps({
  directory: Object,
})
function openExternal(url) {
  window.shell_bridge.openExternal(url)
}
function openPath(path) {
  window.shell_bridge.openPath(path)
}
const directoryDetails = computed(() => {
  var series = props.directory.series.map((item) => {
    var sum = item.videos.reduce((a, b) => {
      var mbps = b.duration.seconds
        ? (b.stat.size / 1024 / 1024 / b.duration.seconds).toFixed(3)
        : null
      return a + (mbps ? parseFloat(mbps) : 0)
    }, 0)
    var count = item.videos.reduce((a, b) => {
      return a + (b.duration?.seconds ? 1 : 0)
    }, 0)
    var size = item.videos.reduce((a, b) => {
      return a + b.stat.size
    }, 0)
    var seconds = item.videos.reduce((a, b) => {
      return a + b.duration.seconds
    }, 0)
    return {
      sum,
      count,
      seconds,
      size,
    }
  })
  var sum = series.reduce((a, b) => {
    return a + (b.sum ? parseFloat(b.sum) : 0)
  }, 0)
  var count = series.reduce((a, b) => {
    return a + b.count
  }, 0)
  var size = series.reduce((a, b) => {
    return a + b.size
  }, 0)
  var seconds = series.reduce((a, b) => {
    return a + b.seconds
  }, 0)
  var parsedDuration = formatSecondsToTimeString(seconds)
  return {
    sum,
    count,
    average: count ? (sum / count).toFixed(3) : null,
    seconds,
    size,
    parsedDuration,
  }
})
const mbpsColor = computed(() => {
  return getMbpsIconColor(directoryDetails.value.average)
})

const videoIcon = computed(() => {
  var url = props.directory?.info?.channel_url || ''
  if (url) {
    return getVideoUrlIcon(url)
  } else {
    return null
  }
})
var imgSrc = ref(null)
async function loadFile(path) {
  let img = await window.videos_bridge.getImage(path)
  imgSrc.value = img
}
if (props.directory.thumbnail) {
  loadFile(props.directory.directoryPath + '\\' + props.directory.thumbnail)
}
</script>
<template>
  <div class="bg-slate-800">
    <div
      class="pl-2 py-1 flex items-center justify-between"
      @click.prevent="directory.collapsed = !directory.collapsed"
    >
      <div class="flex items-center">
        <img
          v-if="imgSrc"
          class="mr-2 my-1 object-cover object-center h-10 w-10 rounded-full"
          :src="'data:image/jpeg;base64,' + imgSrc"
        />
        {{ directory.groupName }}
        <span
          v-if="directory.directoryPath"
          @click.stop="openPath(directory.directoryPath)"
          class="ml-2 mdi mdi-folder-outline"
        >
        </span>
        <span
          v-if="videoIcon"
          @click.stop="openExternal(directory.info.webpage_url)"
          class="mdi cursor-pointer text-lg text-clip"
          :class="`${videoIcon.color} ${videoIcon.icon}`"
        ></span>
        <span
          v-if="directoryDetails.average"
          class="ml-1 group mdi mdi-circle"
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
                w-40
                group-hover:inline-block
              "
              >{{ directoryDetails.average }} Mbps -
              {{ sizeFormat(directoryDetails.size) }}</span
            >
          </span>
        </span>
        <span
          v-if="directoryDetails.seconds"
          class="ml-1 text-sm bg-slate-600 rounded-full px-1"
        >
          {{ directoryDetails.parsedDuration }}</span
        >
      </div>
      <div class="mr-7 text-xl h-6">
        <transition
          enter-active-class="duration-500 ease-in-out"
          leave-active-class="duration-500 ease-in-out"
          enter-from-class="-rotate-180"
          leave-from-class="hidden"
          leave-to-class="hidden"
          enter-to-class=""
        >
          <div :key="directory.collapsed">
            <span
              class="mdi"
              :class="
                directory.collapsed ? 'mdi-chevron-down' : 'mdi-chevron-up'
              "
            ></span>
          </div>
        </transition>
      </div>
    </div>
    <transition
      enter-active-class="duration-500 overflow-hidden ease-in-out"
      leave-active-class="duration-500 overflow-hidden ease-in-out"
      enter-from-class="max-h-0 "
      leave-to-class="max-h-0 "
      enter-to-class="max-h-96"
      leave-from-class="max-h-96"
    >
      <draggable
        v-show="!directory.collapsed"
        v-model="directory.series"
        group="series"
        item-key="seriesName"
      >
        <template #item="{ element }">
          <transition>
            <series :series="element"></series>
          </transition>
        </template>
      </draggable>
    </transition>
  </div>
</template>
<style scoped></style>
