var appname = 'Playlist Manager'
var showDevLogs = process.env.NODE_ENV != 'production' || window.enableDevlog
var origConsole = console
import consoleFunctions from './consoleFunctions'
import overwriteColors from './colors'
import examples from './examples'
function formatTimeParts(hh, mm, ss, ms) {
  return (
    (hh < 10 ? '0' + hh : hh) +
    ':' +
    (mm < 10 ? '0' + mm : mm) +
    ':' +
    (ss < 10 ? '0' + ss : ss) +
    '.' +
    ('00' + ms).slice(-3)
  )
}
function formatConsoleDate(date) {
  var hour = date.getHours()
  var minutes = date.getMinutes()
  var seconds = date.getSeconds()
  var milliseconds = date.getMilliseconds()

  return '[' + formatTimeParts(hour, minutes, seconds, milliseconds) + '] '
}

var baseStyles = [
  'padding-right: 10px',
  'display: block',
  'line-height: 25px',
  'text-align: center',
  'font-weight: bold',
  'text-shadow: 0 1px 0 rgba(0, 0, 0, 0.3)',
  'box-shadow: 0 1px 0 rgba(255, 255, 255, 0.4) inset, 0 5px 3px -5px rgba(0, 0, 0, 0.5), 0 -13px 5px -10px rgba(255, 255, 255, 0.4) inset',
]
var logHandlers = {}

var overwriteHandler = (prop, ctx, options = {}) => {
  var lastTime = ctx.lastTime[prop]
  var newTime = new Date()
  var context = ''
  var defaults = consoleFunctions[prop]
  var diff = lastTime ? newTime - lastTime : null
  if (defaults.icon) {
    context += defaults.icon + ' '
  }
  if (defaults.includeTime || options.time) {
    context += formatConsoleDate(new Date())
  }
  if (options.start) {
    lastTime = null
    ctx.startTime[prop] = newTime
  }
  if (options.stop) {
    var startTime = ctx.startTime[prop]
    diff = startTime ? newTime - startTime : null
    ctx.startTime[prop] = null
    newTime = null
  }
  if (
    (defaults.includeDiff || options.diff) &&
    diff != null &&
    diff != undefined
  ) {
    var msec = diff
    var hh = Math.floor(msec / 1000 / 60 / 60)
    msec -= hh * 1000 * 60 * 60
    var mm = Math.floor(msec / 1000 / 60)
    msec -= mm * 1000 * 60
    var ss = Math.floor(msec / 1000)
    msec -= ss * 1000
    context += `${formatTimeParts(hh, mm, ss, msec)} `
  }
  context += appname + ' '
  if (options.start) {
    context += 'Start '
  }
  if (options.stop) {
    context += 'Stop '
  }
  if (defaults.suffix) {
    context += defaults.suffix
  }

  var styles = baseStyles.concat(overwriteColors[defaults.color]).join(';')
  if (defaults.height) {
    styles += `;line-height: ${defaults.height};`
  }
  ctx.lastTime[prop] = newTime
  // console.log(console.lastTime)

  if (showDevLogs || !defaults.devOnly) {
    return Function.prototype.call.bind(
      origConsole[defaults.fn],
      console,
      `%c ${context}`,
      styles,
    )
  } else if (origConsole.hasOwnProperty(prop)) {
    return Function.prototype.call.bind(origConsole[prop], console)
  } else {
    return () => {}
  }
}

console = new Proxy(
  // Proxy (overwrite console methods here)
  {
    lastTime: {},
    startTime: {},
    base: {},
    rootTarget: this,
    time: new Proxy(
      {},
      {
        get: (target, prop, receiver) => {
          // origConsole.log(this, target, prop, receiver, arguments)
          return overwriteHandler(prop, console.rootTarget, { time: true })
        },
      },
    ),
    diff: new Proxy(
      {},
      {
        get: (target, prop, receiver) => {
          // origConsole.log(this, target, prop, receiver, arguments)
          return overwriteHandler(prop, console.rootTarget, { diff: true })
        },
      },
    ),
    td: new Proxy(
      {},
      {
        get: (target, prop, receiver) => {
          // origConsole.log(this, target, prop, receiver, arguments)
          return overwriteHandler(prop, console.rootTarget, {
            time: true,
            diff: true,
          })
        },
      },
    ),
    start: new Proxy(
      {},
      {
        get: (target, prop, receiver) => {
          // origConsole.log(this, self, target, prop, receiver, arguments)
          return overwriteHandler(prop, console.rootTarget, {
            start: true,
            time: true,
          })
        },
      },
    ),
    stop: new Proxy(
      {},
      {
        get: (target, prop, receiver) => {
          // origConsole.log(this, target, prop, receiver, arguments)
          return overwriteHandler(prop, console.rootTarget, {
            stop: true,
            time: true,
            diff: true,
          })
        },
      },
    ),
  },

  // Handler
  {
    get: (target, prop, receiver) => {
      target.rootTarget = target
      // origConsole.log(this, target, prop, receiver)
      return prop in target
        ? target[prop]
        : consoleFunctions.hasOwnProperty(prop)
        ? overwriteHandler(prop, target)
        : origConsole[prop]
    },
    set: (target, prop, value) => {
      // origConsole.log(this, target, prop, value)
      if (!consoleFunctions[prop]) {
        target[prop] = value
        return true
      } else {
        return false
      }
    },
  },
)
// uncomment this to see examples of each console option called in the examples file
// examples()
