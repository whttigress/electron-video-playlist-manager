import { computed, readonly, ref } from 'vue'

export function useFormatting() {
  function getVideoUrlIcon(url) {
    switch (true) {
      case url.includes('youtube.com'):
        return {
          icon: 'mdi-youtube',
          color: 'text-red-600',
        }
      case url.includes('twitch.tv'):
        return {
          icon: 'mdi-twitch',
          color: 'text-purple-600',
        }
      case url.includes('tv.gab.com'):
        return {
          icon: 'mdi-television-box',
          color: 'text-green-500',
        }
      default:
        return {
          icon: 'mdi-play-network',
          color: 'text-white',
        }
    }
  }
  function getMbpsIconColor(mbps) {
    return mbps > 0.65
      ? 'text-red-600'
      : mbps > 0.6
      ? 'text-orange-700'
      : mbps > 0.55
      ? 'text-orange-500'
      : mbps > 0.5
      ? 'text-amber-500'
      : mbps > 0.45
      ? 'text-yellow-400'
      : mbps > 0.4
      ? 'text-lime-500'
      : mbps > 0.35
      ? 'text-green-500'
      : mbps > 0.3
      ? 'text-emerald-500'
      : 'text-teal-500'
  }
  function formatSecondsToTimeString(seconds) {
    var h = Math.floor(seconds / 3600)
    var m = Math.floor((seconds % 3600) / 60)
    var s = Math.floor((seconds % 3600) % 60)
    var hour = h ? `${h}:` : ''
    var min = `${m.toString().padStart(2, '0')}:`
    var sec = `${s.toString().padStart(2, '0')}`
    return hour + min + sec
  }
  function sizeFormat(value) {
    return `${(value / 1024 / 1024).toFixed(2)} Mb`
  }
  return {
    getVideoUrlIcon,
    getMbpsIconColor,
    formatSecondsToTimeString,
    sizeFormat,
  }
}
