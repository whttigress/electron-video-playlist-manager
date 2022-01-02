import { readFile, writeFile, readdir, stat, access, unlink } from 'fs/promises'
import FindFiles from 'file-regex'
import Settings from './settings'
const path = require('path')
const settings = new Settings({
  // We'll call our data file 'user-preferences'
  configName: 'playlist-preferences',
  defaults: {},
})
settings.initialize()

export const getPlaylistVideos = async (playlistFile) => {
  let playlistVideos = []
  let file = await readFile(playlistFile, 'utf8')
  let lines = file.split(/\r\n|\n|\r/)
  for (const line of lines) {
    try {
      var fileStat = await stat(line)
      var name = path.basename(line)
      var fileName = name.replace(/\.[^/.]+$/, '')
      var duration = fileName.match(/-\(([0-9.]+)\)-/i)
      var d = duration && duration[1] ? Number(duration[1]) : null
      var mbps = d ? (fileStat.size / 1024 / 1024 / d).toFixed(3) : null
      playlistVideos.push({
        filePath: line,
        checked: false,
        name,
        directory: path.basename(path.dirname(line)),
        mbps,
        fileStat,
      })
    } catch (err) {}
  }
  return playlistVideos
}
export const savePlaylist = async (playlistPath, contents) => {
  return writeFile(playlistPath, contents)
}
export const loadPlaylists = async (playlistPath) => {
  const files = await readdir(playlistPath)
  let playlists = []
  for (const file of files) {
    if (file.endsWith('.amppl')) {
      playlists.push(file)
    }
  }
  return playlists
}
