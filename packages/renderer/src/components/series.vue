<script setup>
import videoListing from '/@/components/video.vue'
import draggable from 'vuedraggable'
import {  reactive, computed } from 'vue'
import { useFormatting } from '/@/composables/formatting'
const { getMbpsIconColor, formatSecondsToTimeString, sizeFormat } =
  useFormatting()
var props = defineProps({
  series: Object,
})
const seriesDetails = computed(() => {
  var sum = props.series.videos.reduce((a, b) => {
    var mbps = b.duration.seconds
      ? (b.stat.size / 1024 / 1024 / b.duration.seconds).toFixed(3)
      : null
    return a + (mbps ? parseFloat(mbps) : 0)
  }, 0)
  var count = props.series.videos.reduce((a, b) => {
    return a + (b.duration?.seconds ? 1 : 0)
  }, 0)
  var size = props.series.videos.reduce((a, b) => {
    return a + b.stat.size
  }, 0)
  var seconds = props.series.videos.reduce((a, b) => {
    return a + b.duration.seconds
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
  return getMbpsIconColor(seriesDetails.value.average)
})
</script>
<template>
  <div class="bg-zinc-700 p-1">
    <div
      class="pl-2 flex items-center justify-between"
      @click.prevent="series.collapsed = !series.collapsed"
    >
      <div>
        {{ series.seriesName }}
        <span
          v-if="seriesDetails.average"
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
              >{{ seriesDetails.average }} Mbps -
              {{ sizeFormat(seriesDetails.size) }}</span
            >
          </span>
        </span>
        <span
          v-if="seriesDetails.seconds"
          class="ml-1 text-sm bg-zinc-500 rounded-full px-1"
        >
          {{ seriesDetails.parsedDuration }}</span
        >
      </div>
      <span class="mr-6 text-xl pb-1">
        <transition
          enter-active-class="duration-500 ease-in-out"
          leave-active-class="duration-500 ease-in-out"
          enter-from-class="-rotate-180"
          leave-from-class="hidden"
          leave-to-class="hidden"
          enter-to-class=""
        >
          <div :key="series.collapsed">
            <span
              class="mdi mdi-chevron-up"
              :class="series.collapsed ? 'mdi-rotate-180' : ''"
            ></span>
          </div>
        </transition>
      </span>
    </div>
    <transition
      enter-active-class="duration-500 overflow-hidden ease-in-out"
      leave-active-class="duration-500 overflow-hidden ease-in-out"
      enter-from-class="max-h-0 "
      leave-to-class="max-h-0 "
      enter-to-class="max-h-96"
      leave-from-class="max-h-96"
      ><div class="pl-4 py-2 bg-zinc-600" v-show="!series.collapsed">
        <draggable v-model="series.videos" group="videos" item-key="fileName">
          <template #item="{ element }">
            <videoListing class="" :video="element"></videoListing>
          </template>
        </draggable>
      </div>
    </transition>
  </div>
</template>
<style scoped></style>
