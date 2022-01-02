var appname = 'Playlist Manager'
var isDev = process.env.NODE_ENV != 'production'
var origConsole = console
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
var consoleFunctions = {
  devlog: {
    fn: 'log',
    color: 'appBase',
    devOnly: true,
    includeTime: true,
    includeDiff: true,
  },
  info: {
    fn: 'info',
    icon: 'ℹ',
    suffix: 'Info:',
    color: 'ltBlue',
    devOnly: false,
    includeTime: false,
    includeDiff: false,
  },
  warn: {
    fn: 'warn',
    icon: '⚠',
    suffix: 'WARN:',
    color: 'orange',
    height: '35px',
    devOnly: false,
    includeTime: false,
    includeDiff: false,
  },
  error: {
    fn: 'error',
    icon: '❕',
    suffix: 'ERROR:',
    color: 'red',
    height: '35px',
    devOnly: false,
    includeTime: true,
    includeDiff: false,
  },
  trace: {
    fn: 'trace',
    suffix: 'trace:',
    color: 'cyan',
    devOnly: true,
    includeTime: true,
    includeDiff: true,
  },
  success: {
    fn: 'log',
    icon: '✅',
    suffix: 'Success:',
    color: 'cyan',
    devOnly: true,
    includeTime: false,
    includeDiff: false,
  },
  gray: {
    fn: 'log',
    color: 'gray',
    devOnly: true,
    includeTime: false,
    includeDiff: false,
  },
  cyan: {
    fn: 'log',
    color: 'cyan',
    devOnly: true,
    includeTime: false,
    includeDiff: false,
  },
  ltBlue: {
    fn: 'log',
    color: 'ltBlue',
    devOnly: true,
    includeTime: false,
    includeDiff: false,
  },
  blue: {
    fn: 'log',
    color: 'blue',
    devOnly: true,
    includeTime: false,
    includeDiff: false,
  },
  green: {
    fn: 'log',
    color: 'green',
    devOnly: true,
    includeTime: false,
    includeDiff: false,
  },
  purple: {
    fn: 'log',
    color: 'purple',
    devOnly: true,
    includeTime: false,
    includeDiff: false,
  },
  magenta: {
    fn: 'log',
    color: 'magenta',
    devOnly: true,
    includeTime: false,
    includeDiff: false,
  },
  pink: {
    fn: 'log',
    color: 'pink',
    devOnly: true,
    includeTime: false,
    includeDiff: false,
  },
  yellow: {
    fn: 'log',
    color: 'yellow',
    devOnly: true,
    includeTime: false,
    includeDiff: false,
  },
  orange: {
    fn: 'log',
    color: 'orange',
    devOnly: true,
    includeTime: false,
    includeDiff: false,
  },
  red: {
    fn: 'log',
    color: 'red',
    devOnly: true,
    includeTime: false,
    includeDiff: false,
  },
}
var overwriteColors = {
  appBase: [
    'background: linear-gradient(#FFF, #555)',
    'border: 1px solid #000',
    'color: black',
  ],
  gray: [
    'background: linear-gradient(#FFF, #555)',
    'border: 1px solid #000',
    'color: black',
  ],
  cyan: [
    'background: linear-gradient(#0aa, #055)',
    'border: 1px solid #044',
    'color: white',
  ],
  ltBlue: [
    'background: linear-gradient(#47f, #027)',
    'border: 1px solid #024',
    'color: white',
  ],
  blue: [
    'background: linear-gradient(#00F, #007)',
    'border: 1px solid #000940',
    'color: white',
  ],
  green: [
    'background: linear-gradient(#0f0, #050)',
    'border: 1px solid #040',
    'color: white',
  ],
  purple: [
    'background: linear-gradient(#93f, #50b)',
    'border: 1px solid #306',
    'color: white',
  ],
  magenta: [
    'background: linear-gradient(#F0F, #707)',
    'border: 1px solid #404',
    'color: white',
  ],
  pink: [
    'background: linear-gradient(#f6b, #f18)',
    'border: 1px solid #904',
    'color: white',
  ],
  yellow: [
    'background: linear-gradient(#FF0, #770)',
    'border: 1px solid #440',
    'color: black',
  ],
  orange: [
    'background: linear-gradient(#f50, #720)',
    'border: 1px solid #410',
    'color: white',
  ],
  red: [
    'background: linear-gradient(#F00, #700)',
    'border: 1px solid #400',
    'color: white',
  ],
}
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

  if (isDev || !defaults.devOnly) {
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
// origConsole.log(console.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget.rootTarget)
// console.base.log = origConsole.log
// console.base.info = origConsole.info
// console.base.error = origConsole.error
// console.base.warn = origConsole.warn
// console.base.trace = origConsole.trace
// console.base.error('Oh no!')
// console.error('Oh no!')
// console.base.info('here is some info')
// console.info('here is some info')
// console.time.info('here is some info with the time')
// console.base.warn('warning, warning')
// console.warn('warning, warning')

// console.success('YAY!')
// console.log('a regular log')
// console.devlog('a dev log')
// console.trace('trace')
// // console.trace('trace')
// console.start.gray('this is gray')
// console.pink('this is pink')
// setTimeout(function() {
//   console.gray('this is still gray')
//   console.stop.gray('this is still gray')
//   console.gray('this is gray again')
//   console.gray('this is still still  gray')
// }, 500)
// console.magenta('I did it!')
// console.purple('I did it!')
// console.blue('I did it!')
// console.cyan('I did it!')
// console.green('I did it!')
// console.yellow('I did it!')
// console.orange('I did it!')
// console.red('I did it!')
// console.pink('I did it!')
// console.time.gray('I did it!')
// console.td.gray('I did it!')
// console.gray('I did it!')
// console.lastTime['gray'] = null
// console.diff.gray('I did it!')
// console.gray('I did a reset!')
// console.diff.gray('I did it!')

// for (const [key, value] of Object.entries(console)) {
//   if (typeof value === 'function' && key != 'clear') {
//     value(key)
//     console.log(`${key}: ${value}`)
//   }
// }
