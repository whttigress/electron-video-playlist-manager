import Settings from './settings'
const settings = new Settings({
  // We'll call our data file 'user-preferences'
  configName: 'playlist-preferences',
  defaults: {},
})
settings.initialize()

class LibraryClass {
  constructor(myValue = 1) {
    this.classValue = myValue

    window.myapi.onResponse((args) => {
      if (args.success) this.classValue++
    })
  }

  send() {
    window.myapi.request(this.classValue)
  }
}

export const downloadVideo = (url) => {}
