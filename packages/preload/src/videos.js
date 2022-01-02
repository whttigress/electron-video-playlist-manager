import { readFile, writeFile, readdir, stat, access, unlink } from 'fs/promises'
import promiseIpc from 'electron-promise-ipc'
import FindFiles from 'file-regex'
var ffprobe = require('ffprobe'),
  ffprobeStatic = require('ffprobe-static'),
  path = require('path')
import Settings from './settings'
const settings = new Settings({
  // We'll call our data file 'user-preferences'
  configName: 'playlist-preferences',
  defaults: {},
})
settings.initialize()
export const deleteVideo = async (file) => {
  var lastIndex = file.lastIndexOf('.')
  var filename = file.substr(0, lastIndex)
  try {
    await unlink(filename + '.info.json')
  } catch (err) {}
  try {
    await unlink(filename + '.webp')
  } catch (err) {}
  try {
    await unlink(filename + '.jpg')
  } catch (err) {}
  try {
    await unlink(filename + '.description')
  } catch (err) {}
  return unlink(file)
}
export const getDirectoryFiles = async (currentDirPath) => {
  var fileArray = []
  var directoryJson = null
  var directoryThumbnail = null
  const pictures = await FindFiles(currentDirPath, /-\(NA\)-.+\.jpg$/)
  if (pictures.length > 0) {
    // console.log(picture[0])
    directoryThumbnail = pictures[0].file
  }
  const directoryJsonFiles = await FindFiles(
    currentDirPath,
    /-\(NA\)-.+\.info\.json$/,
  )
  if (directoryJsonFiles.length > 0) {
    const jsonString = await readFile(
      `${currentDirPath}\\${directoryJsonFiles[0].file}`,
      'utf8',
    )
    directoryJson = JSON.parse(jsonString)
    if (directoryJson.extractor == 'GabTV') {
      directoryJson = null
      directoryThumbnail = null
    }
  }
  //read directory contents
  try {
    const files = await readdir(currentDirPath)
    var exclusions = await settings.get('exclusions')
    var allowedExtensions = await settings.get('allowedExtensions')
    for (const file of files) {
      var filePath = path.join(currentDirPath, file)
      if (notExluded(exclusions, filePath)) {
        var pathStat = await stat(filePath)
        if (pathStat.isFile()) {
          if (endsWithAny(allowedExtensions, file)) {
            var fileInfo = {
              name: file,
              filePath,
              stat: pathStat,
              directoryPath: currentDirPath,
              directoryThumbnail,
              directoryJson,
            }
            fileInfo = await getFileDetails(fileInfo)
            fileArray.push(fileInfo)
          }
        } else if (pathStat.isDirectory()) {
          var subDir = await getDirectoryFiles(filePath)
          fileArray = fileArray.concat(subDir)
        }
      }
    }
  } catch (err) {
    // console.error(err)
  }
  // console.log(`directory: ${currentDirPath}`, fileArray)
  return fileArray
}
const getFileDetails = async (fileInfo) => {
  fileInfo.fileName = fileInfo.name.replace(/\.[^/.]+$/, '')
  fileInfo.directory = path.basename(path.dirname(fileInfo.filePath))
  fileInfo.duration = await getVideoDuration(
    fileInfo.filePath,
    fileInfo.fileName,
  )

  var pathWithoutExtension = `${fileInfo.directoryPath}\\${fileInfo.fileName}`
  try {
    let jsonString = await readFile(`${pathWithoutExtension}.info.json`)
    fileInfo.fileJson = JSON.parse(jsonString)
    if (fileInfo.fileJson) {
      if (!fileInfo.directoryJson && fileInfo.fileJson.channel_url) {
        let ytdl = await settings.get('ytdlpExePath')
        console.log('get thumbnail and info', fileInfo)
        //todo: await this and get it again?
        promiseIpc.send('downloadImageAndJson', {
          command: ytdl,
          args: [
            fileInfo.fileJson.channel_url,
            '--skip-download', //skips video files
            '--playlist-end 1', //must get at least one file in playlist or exe crashes
            '-o "thumbnail:"', //only downloads playlist thumbnails
            '-o "infojson:"', //only downloads playlist info json
          ],
        })
      }
    }
  } catch (err) {}
  if (!fileInfo.fileJson) {
    var videoId = fileInfo.fileName
      .replace(/-\([0-9.]+\)-/gi, ' |*|')
      .match(/(?:\|\*\|)([A-Z0-9\-_]+)$/i)
    videoId = !videoId ? null : videoId[1]
    if (videoId) {
      var regexString = `/-${videoId}.info\.json$/`
      const videoJson = await FindFiles(fileInfo.directoryPath, regexString)
      if (videoJson.length > 0) {
        const jsonString = await readFile(
          `${fileInfo.directoryPath}\\${videoJson[0].file}`,
          'utf8',
        )
        fileInfo.fileJson = JSON.parse(jsonString)
      }
    }
  }
  try {
  } catch (err) {}
  try {
    await access(`${pathWithoutExtension}.webp`)
    fileInfo.fileThumbnail = `${pathWithoutExtension}.webp`
  } catch (err) {}
  try {
    await access(`${pathWithoutExtension}.jpg`)
    fileInfo.fileThumbnail = `${pathWithoutExtension}.jpg`
  } catch (err) {}
  if (!fileInfo.fileThumbnail) {
    var videoId = fileInfo.fileName
      .replace(/-\([0-9.]+\)-/gi, ' |*|')
      .match(/(?:\|\*\|)([A-Z0-9\-_]+)$/i)
    videoId = !videoId ? null : videoId[1]
    if (videoId) {
      var regexString = `/-${videoId}.[webp|jpg]$/`
      const thumbnails = await FindFiles(fileInfo.directoryPath, regexString)
      if (thumbnails.length > 0) {
        fileInfo.thumbnail = `${fileInfo.directoryPath}\\${thumbnails[0].file}`
      }
    }
  }
  return fileInfo
}
const getVideoDuration = async (filePath, fileName) => {
  var durationMatch = fileName.match(/-\(([0-9.]+)\)-/i)
  var d = durationMatch && durationMatch[1] ? Number(durationMatch[1]) : null
  if (!d) {
    try {
      let info = await ffprobe(filePath, {
        path: ffprobeStatic.path.replace('app.asar', 'app.asar.unpacked'),
      })
      console.log(info)
      if (info?.streams[0]?.tags?.DURATION) {
        var a = info?.streams[0]?.tags?.DURATION?.split(':') // split it at the colons
        // minutes are worth 60 seconds. Hours are worth 60 minutes.
        d = +a[0] * 60 * 60 + +a[1] * 60 + +parseFloat(a[2])
      } else if (info?.streams[0]?.duration) {
        d = parseFloat(info.streams[0].duration)
      }
    } catch (e) {
      console.error(e)
    }
  }
  var parsedDuration = formatSecondsToTimeString(d)
  return {
    seconds: d,
    duration: parsedDuration,
  }
}
const formatSecondsToTimeString = (seconds) => {
  var h = Math.floor(seconds / 3600)
  var m = Math.floor((seconds % 3600) / 60)
  var s = Math.floor((seconds % 3600) % 60)
  var hour = h ? `${h}:` : ''
  var min = `${m.toString().padStart(2, '0')}:`
  var sec = `${s.toString().padStart(2, '0')}`
  return hour + min + sec
}
const endsWithAny = (suffixes, string) => {
  return suffixes.some(function (suffix) {
    return string.toLowerCase().endsWith(suffix.toLowerCase())
  })
}
const notExluded = (exclusions, string) => {
  return !exclusions.some(function (exclusion) {
    return string.toUpperCase().includes(exclusion.toUpperCase())
  })
}
