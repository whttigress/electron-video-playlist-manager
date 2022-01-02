import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import debounce from 'lodash/debounce'
import rfdc from 'rfdc'
const clone = rfdc()
export const useSettings = defineStore('settingsStore', () => {
  const prefs = ref({})
  watch(
    () => prefs.value,
    debounce((nval, oval) => window.settings_bridge.saveAll(clone(nval)), 1000),
    { deep: true },
  )
  getPreferences()
  async function getPreferences() {
    let res = await window.settings_bridge.init({
      configName: 'playlist-preferences',
      defaults: {},
    })
    prefs.value = res.data
  }
  async function get(key) {
    let response = await window.settings_bridge.get(key)
    prefs.value[key] = response
    return response
  }
  async function save(key, value) {
    prefs.value[key] = value
    return window.settings_bridge.save(key, value)
  }
  console.log(prefs.value)
  return {
    prefs,
    get,
    save,
    getPreferences,
  }
})
