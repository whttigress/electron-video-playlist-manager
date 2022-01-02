<script setup>
import { useVideoList } from '/@/stores/videoList'
import { useSettings } from '/@/stores/settings'
import directory from '/@/components/directory.vue'
import playlistFiles from '/@/components/playlistfiles.vue'
import preferences from '/@/components/preferences.vue'
import downloader from '/@/components/downloader.vue'
import draggable from 'vuedraggable'
import { computed, defineComponent, ref } from 'vue'
import { storeToRefs } from 'pinia'
import { useFormatting } from '/@/composables/formatting'
const { formatSecondsToTimeString, sizeFormat } = useFormatting()
const settingsStore = useSettings()
const videoStore = useVideoList()
const skippedFiles = ref([
  {
    groupName: 'Skipped',
    series: [{ seriesName: '‎', videos: [] }],
  },
])
videoStore.getVideoList()
const { groupedAndSortedVideos, filterString } = storeToRefs(videoStore)
async function savePlaylist() {
  var files = videoStore.getFilePaths(groupedAndSortedVideos.value)
  console.log(files)
  var playlistDir = await settingsStore.get('saveDirectory')
  var playlistName = await settingsStore.get('playlistName')
  await window.playlist_bridge.savePlaylist(playlistDir + playlistName, files)
}
function resortFiles() {
  skippedFiles.value = [
    {
      groupName: 'Skipped',
      series: [{ seriesName: '‎', videos: [] }],
    },
  ]
  videoStore.sortAndGroupVideos()
}
function refreshDirectory() {
  skippedFiles.value = [
    {
      groupName: 'Skipped',
      series: [{ seriesName: '‎', videos: [] }],
    },
  ]
  videoStore.getVideoList()
}

function skipAdd(evt) {
  //go through skippedFiles array and collapse all directroies except the first one
  skippedFiles.value.sort((a, b) => {
    return a.groupName == 'Skipped' ? -1 : 1
  })
  console.log(skippedFiles.value)
  for (var i = 0; i < skippedFiles.value.length; i++) {
    if (i > 0) {
      skippedFiles.value[i].collapsed = true
    }
  }
}
var summaryTotals = computed(() => {
  var totals = groupedAndSortedVideos.value.map((dir) => {
    var series = dir.series.map((item) => {
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
    return {
      series,
      sum,
      count,
      average: count ? (sum / count).toFixed(3) : null,
      seconds,
      size,
    }
  })
  var sum = totals.reduce((a, b) => {
    return a + (b.sum ? parseFloat(b.sum) : 0)
  }, 0)
  var count = totals.reduce((a, b) => {
    return a + b.count
  }, 0)
  var size = totals.reduce((a, b) => {
    return a + b.size
  }, 0)
  var seconds = totals.reduce((a, b) => {
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
</script>
<template>
  <div class="m-4 text-white">
    <div>
      <button
        class="btn bg-slate-500 border border-slate-900 m-1 hover:bg-slate-700"
        @click="refreshDirectory"
      >
        refresh
      </button>
      <button
        class="btn bg-slate-500 border border-slate-900 m-1 hover:bg-slate-700"
        @click="resortFiles"
      >
        sort
      </button>
      <button
        class="btn bg-slate-500 border border-slate-900 m-1 hover:bg-slate-700"
        @click="savePlaylist"
      >
        save playlist
      </button>
      <playlistFiles></playlistFiles>
      <preferences></preferences>
      <downloader></downloader>
    </div>
    <div class="my-1 mb-2">
      <span class="m-1">
        <span class="p-1 bg-cyan-700 border-r border-cyan-900 shadow-inner">
          Count:
        </span>
        <span
          class="p-1 px-2 bg-cyan-600 border-l border-cyan-900 shadow-inner"
        >
          {{ summaryTotals.count }}
        </span>
      </span>
      <span class="m-1"
        ><span class="p-1 bg-cyan-700 border-r border-cyan-900 shadow-inner">
          Duration:
        </span>
        <span class="p-1 px-2 bg-cyan-600 border-l border-cyan-900 shadow-inner"
          >{{ summaryTotals.parsedDuration }}
        </span></span
      >
      <span class="m-1"
        ><span class="p-1 bg-cyan-700 border-r border-cyan-900 shadow-inner">
          Size:
        </span>
        <span
          class="p-1 px-2 bg-cyan-600 border-l border-cyan-900 shadow-inner"
        >
          {{ sizeFormat(summaryTotals.size) }}
        </span></span
      >
    </div>
    <div class="grid lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2">
        <draggable
          v-model="groupedAndSortedVideos"
          group="directories"
          item-key="groupName"
        >
          <template #item="{ element }">
            <directory :directory="element"></directory>
          </template>
        </draggable>
      </div>
      <div>
        <draggable
          v-model="skippedFiles"
          group="directories"
          item-key="groupName"
          @add="skipAdd"
        >
          <template #item="{ element }">
            <directory :directory="element"></directory>
          </template>
        </draggable>
      </div>
    </div>
  </div>
</template>
<style scoped></style>
