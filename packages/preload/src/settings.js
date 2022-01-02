import promiseIpc from 'electron-promise-ipc'
const path = require('path')

import { readFile, writeFile } from 'fs/promises'

class Settings {
  constructor(opts) {
    this.userDataPath = null
    this.defaults = opts.defaults
    this.configName = opts.configName
    // We'll use the `configName` property to set the file name and path.join to bring it all together as a string
  }
  async initialize() {
    let path = await promiseIpc.send('getPath')
    this.userDataPath = path
    this.data = await parseDataFile(this.getPath(), this.defaults)
  }
  getPath() {
    return path.join(this.userDataPath, this.configName + '.json')
  }

  // This will just return the property on the `data` object
  async get(key) {
    if (!this.userDataPath) {
      await this.initialize()
    }
    this.data = await parseDataFile(this.getPath(), this.defaults)
    return this.data[key]
  }

  // ...and this will set it
  async set(key, val) {
    if (!this.userDataPath) {
      await this.initialize()
    }
    this.data[key] = val
    try {
      await writeFile(this.getPath(), JSON.stringify(this.data))
    } catch (err) {
      // When a request is aborted - err is an AbortError
      console.error(err)
    }
  }
  async saveAll(val) {
    if (!this.userDataPath) {
      await this.initialize()
    }
    this.data = JSON.parse(JSON.stringify(val))
    try {
      await writeFile(this.getPath(), JSON.stringify(this.data))
    } catch (err) {
      // When a request is aborted - err is an AbortError
      console.error(err)
    }
  }
}

async function parseDataFile(filePath, defaults) {
  // We'll try/catch it in case the file doesn't exist yet, which will be the case on the first application run.
  // `fs.readFileSync` will return a JSON string which we then parse into a Javascript object
  try {
    let file = await readFile(filePath)
    let json = JSON.parse(file)
    return Object.assign(defaults, json)
  } catch (error) {
    // if there was some kind of error, return the passed in defaults instead.
    return defaults
  }
}

// expose the class
export default Settings
