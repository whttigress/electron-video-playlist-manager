import { defineStore } from 'pinia'
import { useSettings } from '/@/stores/settings'
import stringSimilarity from 'string-similarity'
import debounce from 'lodash/debounce'
import { ref, computed, watch } from 'vue'

export const useVideoList = defineStore('videoList', () => {
  const videoList = ref([])
  const groupedAndSortedVideos = ref([])
  const filterString = ref('')

  const filteredVideoList = computed(() => {
    const list = videoList.value
    const filterText = filterString.value.toLowerCase()
    let filteredList = []
    for (let file of list) {
      if (file.filePath.toLowerCase().includes(filterText)) {
        filteredList.push(file)
      }
    }
    return filteredList
  })
  function findEpisode(string) {
    var r = /\d+/g
    var matches = string.match(r)
    if (matches == null) {
      return null
    } else if (matches.length == 1) {
      return Number(matches[0])
    } else {
      var epReg = /(?:(#|ep|part|episode|E)\s?)([\d])+/gi
      var epmatch = string.match(epReg)
      if (epmatch?.length == 1) {
        // if (epmatch && epmatch.length == 1) {
        return Number(epmatch[0].match(r)[0])
      } else {
        var r3 = /(?:(-)\s?)([\d])+/g
        var m3 = string.match(r3)
        if (m3?.length == 1) {
          return Number(m3[0].match(r)[0])
        } else {
          return matches
        }
      }
    }
  }
  async function getVideoList() {
    groupedAndSortedVideos.value = []
    var videoFilePath = await useSettings().get('videoFilePath')
    console.log('retrieve videos')
    videoList.value = await window.videos_bridge.getVideoList(videoFilePath)
  }
  const debounceSort = debounce(() => {
    console.log('debounce sort')
    sortAndGroupVideos()
  }, 750)
  // watch(videoList.value, sortAndGroupVideos)
  watch(filteredVideoList, debounceSort)
  function removeVideo(path) {
    let i = videoList.value.findIndex((x) => x.filePath == path)
    if (i >= 0) {
      videoList.value.splice(i, 1)
    }
  }
  async function sortAndGroupVideos() {
    console.log('sortAndGroupVideos')
    var ignoreNames = await useSettings().get('ignoreNames')
    var grouped = {}
    for (let video of filteredVideoList.value) {
      if (grouped[video.directory]) {
        grouped[video.directory].push(video)
      } else {
        grouped[video.directory] = [video]
      }
    }
    var groups = {}
    for (let group in grouped) {
      groups[group] = {}
      let videos = grouped[group]
      let thumb = videos.find((x) => x.directoryThumbnail)
      let json = videos.find((x) => x.directoryJson)
      let directoryPath = videos.find((x) => x.directoryPath)
      groups[group].groupName = group
      groups[group].thumbnail = thumb?.directoryThumbnail
      groups[group].info = {}
      groups[group].info.uploader = json?.directoryJson?.uploader
      groups[group].info.uploader_id = json?.directoryJson?.uploader_id
      groups[group].info.uploader_url = json?.directoryJson?.uploader_url
      groups[group].info.channel = json?.directoryJson?.channel
      groups[group].info.channel_id = json?.directoryJson?.channel_id
      groups[group].info.channel_url = json?.directoryJson?.channel_url
      groups[group].info.id = json?.directoryJson?.id
      groups[group].info.title = json?.directoryJson?.title
      groups[group].info.webpage_url = json?.directoryJson?.webpage_url
      groups[group].info.original_url = json?.directoryJson?.original_url
      groups[group].info.webpage_url_basename =
        json?.directoryJson?.webpage_url_basename
      groups[group].info.extractor = json?.directoryJson?.extractor
      groups[group].directoryPath = directoryPath?.directoryPath
      groups[group].series = []
      var series = []
      var matchPercentage = await useSettings().get('matchPercentage')
      for (let video of videos) {
        let info = {
          id: video.fileJson?.id,
          title: video.fileJson?.title,
          description: video.fileJson?.description,
          upload_date: video.fileJson?.upload_date,
          uploader: video.fileJson?.uploader,
          uploader_id: video.fileJson?.uploader_id,
          uploader_url: video.fileJson?.uploader_url,
          channel: video.fileJson?.channel,
          channel_id: video.fileJson?.channel_id,
          channel_url: video.fileJson?.channel_url,
          duration: video.fileJson?.duration,
          view_count: video.fileJson?.view_count,
          webpage_url: video.fileJson?.webpage_url,
          is_live: video.fileJson?.is_live,
          was_live: video.fileJson?.was_live,
          like_count: video.fileJson?.like_count,
          original_url: video.fileJson?.original_url,
          webpage_url_basename: video.fileJson?.webpage_url_basename,
          extractor: video.fileJson?.extractor,
          playlist: video.fileJson?.playlist,
          playlist_id: video.fileJson?.playlist_id,
          playlist_title: video.fileJson?.playlist_title,
          playlist_uploader: video.fileJson?.playlist_uploader,
          playlist_uploader_id: video.fileJson?.playlist_uploader_id,
          display_id: video.fileJson?.display_id,
          ext: video.fileJson?.ext,
          resolution: video.fileJson?.resolution,
          epoch: video.fileJson?.epoch,
        }
        var fileName = video.fileName
        var videoId = null
        if (info.id) {
          videoId = info.id
        } else {
          videoId = fileName
            .replace(/-\([0-9.]+\)-/gi, ' |*|')
            .match(/(?:\|\*\|)([A-Z0-9\-_]+)$/i)
          videoId = !videoId ? null : videoId[1]
        }
        var link = null
        if (info.webpage_url || info.original_url) {
          link = info.webpage_url || info.original_url
        } else if (videoId) {
          link = `https://www.youtube.com/watch?v=${videoId}`
        }
        if (link && !video.fileJson) {
          window.youtube_bridge.downoladVideoImageAndJson(link)
        }
        var shortName = fileName
          .replace(/-\([0-9.]+\)-/gi, ' ')
          .replace(/[^A-Z0-9\s]/gi, '')
          .replace(/\b\d+\b/g, '')
        for (var ignore of ignoreNames) {
          let regex = new RegExp(`\\b${ignore}\\b`, 'gi')
          shortName = shortName.replace(regex, '')
        }
        var groupWords = group.split(' ')
        for (var word of groupWords) {
          let regex = new RegExp(`\\b${word}\\b`, 'gi')
          shortName = shortName.replace(regex, '')
        }

        shortName = shortName.replace(videoId, '').trim()
        var trimmedName = fileName
          .replace(/-\([0-9.]+\)-/gi, '')
          .replace(videoId, '')
          .trim()
        var episode = findEpisode(trimmedName)
        let directory = {
          name: video.directory,
          path: video.directoryPath,
          thumbnail: video.directoryThumbnail,
        }
        var mappedVideo = {
          directory,
          info,
          duration: video.duration,
          name: video.name,
          fileName: video.fileName,
          filePath: video.filePath,
          fileThumbnail: video.fileThumbnail,
          stat: video.stat,
          videoId,
          link,
          trimmedName,
          shortName,
          episode,
        }

        // check if the item belongs in an already created group
        var added = series.some(function (group) {
          // check if the item belongs in this group
          var shouldAdd = (function () {
            var maxMatch = 0
            for (let entry of group) {
              var similarity = stringSimilarity.compareTwoStrings(
                entry.shortName,
                mappedVideo.shortName,
              )
              if (similarity > maxMatch) {
                maxMatch = similarity
              }
              if (maxMatch > matchPercentage) {
                entry.match = maxMatch
              }
            }
            return maxMatch > matchPercentage
          })()
          // add item to this group if it belongs
          if (shouldAdd) {
            group.push(mappedVideo)
          }
          // exit the loop when an item is added, continue if not
          return shouldAdd
        })
        // no matching group was found, so a new group needs to be created for this item
        if (!added) {
          series.push([mappedVideo])
        }
      }
      for (var item of series) {
        var n = getMatchedWords(item, 'trimmedName')
        for (var ignore of ignoreNames) {
          var regex = new RegExp(`\\b${ignore}\\b`, 'gi')
          n = n.replace(regex, '')
        }
        var groupWords = group.split(' ')
        for (var word of groupWords) {
          let regex = new RegExp(`\\b${word}\\b`, 'gi')
          n = n.replace(regex, '')
        }
        n = n.trim()
        item.sort(function (l, r) {
          if (Array.isArray(l.episode) && Array.isArray(r.episode)) {
            var left = l.episode.filter((val) => !r.episode.includes(val))
            var right = r.episode.filter((val) => !l.episode.includes(val))
            l.fixedEpisode = Number(left[0])
            r.fixedEpisode = Number(right[0])
            return Number(left[0]) - Number(right[0])
          }
          return l.episode - r.episode
        })
        let s = { seriesName: n, videos: item }
        groups[group].series.push(s)
      }
    }
    groupedAndSortedVideos.value = Object.values(groups)
  }
  function getMatchedWords(array, key) {
    var words = array.length > 0 ? array[0][key].split(/[^A-Z0-9'.]+/gi) : []
    var m = words.filter(function (word) {
      return array.every(function (item) {
        return item[key]
          .toUpperCase()
          .split(/[^A-Z0-9'.]+/gi)
          .includes(word.toUpperCase())
      })
    })
    return m.join(' ')
  }
  function getFilePaths(array) {
    var result = ''
    let skip = ['directory', 'info', 'duration', 'stat']
    for (let item of array) {
      if (item && item.filePath) {
        // console.log(item)
        result += item.filePath + '\n'
      } else if (Array.isArray(item)) {
        // console.log(item)
        result += getFilePaths(item)
      } else if (typeof item == 'object') {
        // console.log(item)
        Object.entries(item).forEach(function (entry) {
          const [key, value] = entry
          // console.log(key, Array.isArray(key))
          if (skip.includes(key)) return
          // console.log(item, key, value)
          if (Array.isArray(key)) {
            result += getFilePaths(key)
          }
          if (Array.isArray(value)) {
            result += getFilePaths(value)
          }
        })
      }
    }
    return result
  }
  return {
    videoList,
    groupedAndSortedVideos,
    getVideoList,
    sortAndGroupVideos,
    getFilePaths,
    filterString,
    removeVideo,
  }
})

export default useVideoList
