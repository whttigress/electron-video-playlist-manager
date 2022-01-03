import { app, BrowserWindow, shell, dialog, ipcMain } from 'electron'
import path from 'path'
import promiseIpc from 'electron-promise-ipc'
import { join } from 'path'
import { URL } from 'url'
import './security-restrictions'
const child_process = require('child_process')

const isSingleInstance = app.requestSingleInstanceLock()
const isDevelopment =
  import.meta.env.MODE === 'development' || import.meta.env.DEV

if (!isSingleInstance) {
  app.quit()
  process.exit(0)
}

// Install "Vue.js devtools"
let mainWindow = null

const createOrRestoreWindow = async () => {
  // If window already exist just show it
  if (mainWindow && !mainWindow.isDestroyed()) {
    if (mainWindow.isMinimized()) mainWindow.restore()
    mainWindow.focus()

    return
  }
  mainWindow = new BrowserWindow({
    show: false, // Use 'ready-to-show' event to show window
    webPreferences: {
      nativeWindowOpen: true,
      preload: join(__dirname, '../../preload/dist/index.cjs'),
    },
    height: 1000, // height
    width: 1600, // width
    titleBarStyle: 'hidden',
    icon: path.join(__dirname, '../../renderer/icon.png'),
  })

  /**
   * If you install `show: true` then it can cause issues when trying to close the window.
   * Use `show: false` and listener events `ready-to-show` to fix these issues.
   *
   * @see https://github.com/electron/electron/issues/25012
   */
  mainWindow.on('ready-to-show', () => {
    mainWindow?.show()

    if (isDevelopment) {
      mainWindow?.webContents.openDevTools()
    }
  })

  /**
   * URL for main window.
   * Vite dev server for development.
   * `file://../renderer/index.html` for production and test
   */
  const pageUrl =
    isDevelopment && import.meta.env.VITE_DEV_SERVER_URL !== undefined
      ? import.meta.env.VITE_DEV_SERVER_URL
      : new URL('../renderer/dist/index.html', 'file://' + __dirname).toString()

  await mainWindow.loadURL(pageUrl)
}

app.on('second-instance', () => createOrRestoreWindow)

app.disableHardwareAcceleration()

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app
  .whenReady()
  .then(createOrRestoreWindow)
  .catch((e) => console.error('Failed create window:', e))

/**
 * Install Vue.js or some other devtools in development mode only
 */
if (isDevelopment) {
  app
    .whenReady()
    .then(() => import('electron-devtools-installer'))
    .then(({ default: installExtension, VUEJS3_DEVTOOLS }) =>
      installExtension(VUEJS3_DEVTOOLS, {
        loadExtensionOptions: {
          allowFileAccess: true,
        },
      }),
    )
    .catch((e) => console.error('Failed install extension:', e))
}

// Auto-updates
if (import.meta.env.PROD) {
  app
    .whenReady()
    .then(() => import('electron-updater'))
    .then(({ autoUpdater }) => autoUpdater.checkForUpdatesAndNotify())
    .catch((e) => console.error('Failed check updates:', e))
}

promiseIpc.on('getPath', (args, event) => {
  return app.getPath('userData')
})
promiseIpc.on('selectDirectory', (args, event) => {
  return dialog.showOpenDialog(mainWindow, {
    defaultPath: args,
    properties: ['openDirectory'],
  })
})
promiseIpc.on('selectFile', (args, event) => {
  return dialog.showOpenDialog(mainWindow, {
    defaultPath: args.path,
    filters: args.filters,
    properties: ['openFile'],
  })
})
promiseIpc.on('openPath', (args, event) => {
  shell.openPath(args)
})
promiseIpc.on('openExternal', (args, event) => {
  shell.openExternal(args)
})
promiseIpc.on('downloadImageAndJson', (args, event) => {
  run_script(args.command, args.args, args.callback)
})
promiseIpc.on('runScript', (args, event) => {
  run_script(args.command, args.args, args.callback)
})
promiseIpc.on('downloadImageAndJson', (args, event) => {
  return run_script_async(args.command, args.args)
})
ipcMain.on('downloadVideo', (event, args) => {
  console.log(args)
  run_script(args.command, args.args, 'downloadResponse')
})
ipcMain.on('app:close', (args, event) => {
  //
  app.quit()
})
ipcMain.on('app:minimize', (args, event) => {
  //
  mainWindow.minimize()
})
ipcMain.on('app:maximize', (args, event) => {
  if (mainWindow.isMaximized()) {
    mainWindow.unmaximize()
  } else {
    mainWindow.maximize()
  }
})
ipcMain.on('toggle-dev-tools', (args, event) => {
  //
  mainWindow.webContents.toggleDevTools()
})

// This function will output the lines from the script
// and will return the full combined output
// as well as exit code when it's done (using the callback).
function run_script(command, args, callback) {
  console.log(command, args, callback)
  var child = child_process.spawn(command, args, {
    encoding: 'utf8',
    shell: true,
  })
  var responseMessage = 'mainprocess-response'
  if (typeof callback === 'string') {
    responseMessage = callback
  }
  // You can also use a variable to save the output for when the script closes later
  child.on('error', (error) => {
    dialog.showMessageBox({
      title: 'Title',
      type: 'warning',
      message: 'Error occured.\r\n' + error,
    })
  })

  child.stdout.setEncoding('utf8')
  child.stdout.on('data', (data) => {
    //Here is the output
    data = data.toString()
    mainWindow.webContents.send(responseMessage, data)
    // console.log(data)
  })

  child.stderr.setEncoding('utf8')
  child.stderr.on('data', (data) => {
    // Return some data to the renderer process with the mainprocess-response ID
    mainWindow.webContents.send(responseMessage, data)
    //Here is the output from the command
    console.log(data)
  })

  child.on('close', (code) => {
    //Here you can get the exit code of the script
    switch (code) {
      case 0:
        mainWindow.webContents.send(responseMessage, '--closed--')
        break
    }
  })
  if (typeof callback === 'function') callback()
}
// This function will output the lines from the script
// and will return the full combined output
// as well as exit code when it's done (using the callback).
const run_script_async = async (command, args) => {
  return new Promise((resolve, reject) => {
    var child = child_process.spawn(command, args, {
      encoding: 'utf8',
      shell: true,
    })
    var log = ''
    // You can also use a variable to save the output for when the script closes later
    child.on('error', (error) => {
      reject(error)
    })

    child.stdout.setEncoding('utf8')

    child.stdout.on('data', (data) => {
      //Here is the output
      data = data.toString()
      log = log + '\n' + data
      // mainWindow.webContents.send(responseMessage, data)
      // console.log(data)
    })

    child.stderr.setEncoding('utf8')
    child.stderr.on('data', (data) => {
      log = log + '\n' + data.toString()
      // Return some data to the renderer process with the mainprocess-response ID
      // mainWindow.webContents.send(responseMessage, data)
      //Here is the output from the command
      console.log(data)
      // reject(log)
    })

    child.on('close', (code) => {
      //Here you can get the exit code of the script
      switch (code) {
        case 0:
          resolve(log)
          break
        default:
          reject(log)
          break
      }
    })
  })
}
