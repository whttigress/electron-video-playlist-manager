import { contextBridge, ipcRenderer, remote } from 'electron'

import Settings from './settings'
const settings = new Settings({
  // We'll call our data file 'user-preferences'
  configName: 'playlist-preferences',
  defaults: {},
})
settings.initialize()
import { getDirectoryFiles, deleteVideo } from './videos'
import { getPlaylistVideos, savePlaylist, loadPlaylists } from './playlist'

import { readFile, writeFile, unlink } from 'fs/promises'

import promiseIpc from 'electron-promise-ipc'
/**
 * The "Main World" is the JavaScript context that your main renderer code runs in.
 * By default, the page you load in your renderer executes code in this world.
 *
 * @see https://www.electronjs.org/docs/api/context-bridge
 */

/**
 * After analyzing the `exposeInMainWorld` calls,
 * `packages/preload/exposedInMainWorld.d.ts` file will be generated.
 * It contains all interfaces.
 * `packages/preload/exposedInMainWorld.d.ts` file is required for TS is `renderer`
 *
 * @see https://github.com/cawa-93/dts-for-context-bridge
 */

/**
 * Expose Environment versions.
 * @example
 * console.log( window.versions )
 */

contextBridge.exposeInMainWorld('app_bridge', {
  exit() {
    ipcRenderer.send('app:close')
  },
  minimize() {
    ipcRenderer.send('app:minimize')
  },
  maximize() {
    ipcRenderer.send('app:maximize')
  },
  toggleDevTools() {
    ipcRenderer.send('toggle-dev-tools')
  },
})
contextBridge.exposeInMainWorld('videos_bridge', {
  getVideoList: async (path) => {
    return getDirectoryFiles(path)
  },
  getImage: async (path) => {
    return readFile(path, 'base64')
  },
  deleteVideo: async (path) => {
    return deleteVideo(path)
  },
})
contextBridge.exposeInMainWorld('playlist_bridge', {
  getPlaylistList: async (path) => {
    return getPlaylistVideos(path)
  },
  loadPlaylists: async (path) => {
    return loadPlaylists(path)
  },
  savePlaylist: async (path, data) => {
    return savePlaylist(path, data)
  },
  deletePlaylist: async (path) => {
    return unlink(path)
  },
})
const defaultPrefs = {
  videoFilePath: 'D:\\video\\youtube\\',
  saveDirectory: 'C:\\Users\\whtti\\OneDrive\\Documents\\',
  playlistName: 'MediaPlayListNew.amppl',
  allowedExtensions: ['.mkv', '.mp4'],
  matchPercentage: 0.34,
  exclusions: ['noplaylistarchive', 'temp_in_progress_downloads'],
  ignoreNames: [
    'episode',
    'lets',
    "let's",
    'play',
    'game',
    'gameplay',
    'part',
    'stream',
    'vod',
    'giveaway',
    'of',
    'the',
    'season',
  ],
}

contextBridge.exposeInMainWorld('settings_bridge', {
  settings: null,
  init: async (options) => {
    options.defaults = defaultPrefs
    this.settings = new Settings(options)
    await this.settings.initialize()
    return this.settings
  },
  get: async (key) => {
    return this.settings.get(key)
  },
  saveAll: async (data) => {
    return this.settings.saveAll(data)
  },
  save: async (key, data) => {
    return this.settings.set(key, data)
  },
  selectDirectory: async (current) => {
    return promiseIpc.send('selectDirectory', current)
  },
  selectFile: async (current, filters) => {
    return promiseIpc.send('selectFile', { path: current, filters })
  },
})
contextBridge.exposeInMainWorld('shell_bridge', {
  openPath: async (path) => {
    return promiseIpc.send('openPath', path)
  },
  openExternal: async (url) => {
    return promiseIpc.send('openExternal', url)
  },
  runCommand: async (options) => {
    return promiseIpc.send('runScript', options)
  },
  onCommandResponse: (fn) => {
    // Deliberately strip event as it includes `sender`
    ipcRenderer.on('mainprocess-response', (event, ...args) => fn(...args))
  },
})
contextBridge.exposeInMainWorld('youtube_bridge', {
  // downloadVideo: async (url, options) => {},
  allowRedownload: async (provider, videoid) => {},
  loadBatList: async (path) => {},
  loadBat: async (path) => {},
  saveBat: async (path, data) => {},
  downloadChannelImageAndJson: async (channel) => {
    let ytdl = await settings.get('ytdlpExePath')
    return promiseIpc.send('downloadImageAndJson', {
      command: ytdl,
      args: [
        channel,
        '--skip-download', //skips video files
        '--playlist-end 1', //must get at least one file in playlist or exe crashes
        '-o "thumbnail:"', //only downloads playlist thumbnails
        '-o "infojson:"', //only downloads playlist info json
      ],
    })
  },
  downloadVideoImageAndJson: async (url) => {
    let ytdl = await settings.get('ytdlpExePath')
    return promiseIpc.send('downloadImageAndJson', {
      command: ytdl,
      args: [
        url,
        '--skip-download', //skips video files
        '--playlist-end 1', //must get at least one file in playlist or exe crashes
      ],
    })
  },

  downloadVideo: async (data) => {
    let ytdl = await settings.get('ytdlpExePath')
    ipcRenderer.send('downloadVideo', { command: ytdl, args: [data] })
  },
  onDownloadResponse: (fn) => {
    // Deliberately strip event as it includes `sender`
    ipcRenderer.on('downloadResponse', (event, ...args) => fn(...args))
  },
})
