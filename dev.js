const webpack = require('webpack')
const conf = require('./webpack.config')
const { fork } = require('child_process')
const chokidar = require('chokidar')
const chalk = require('chalk')

const log = {
  success: msg => console.log(chalk.green(msg)),
  warning: msg => console.log(chalk.keyword('orange')(msg)),
  error: msg => console.log(chalk.red(chalk.bold('ERROR:') + ' ' + msg))
}

const processes = {
  error: false,
  node: false,
  webpack: webpack({
    ...conf,
    mode: 'development',
    plugins: [
      new webpack.DefinePlugin({
        'process.env.NODE_ENV': '"development"'
      })
    ]
  }),
  handleError (err) {
    log.error(err.stack || err)
    if (err.details) {
      log.error(err.details)
    }
  },
  compileClient () {
    this.webpack.run((err, stats) => {
      if (err) {
        this.handleError(err)
      } else {
        const info = stats.toJson()
        if (stats.hasErrors()) {
          log.error(info.errors)
        }
        if (stats.hasWarnings()) {
          log.warning(info.warnings)
        }
        log.success(`client:compiled ${chalk.bold(stats.endTime - stats.startTime)}ms`)
        this.node && this.node.send('client:reload')
      }
    })
  },
  startNode () {
    const startTime = Date.now()
    if (this.error) {
      this.error = false
    } else if (this.node) {
      this.node.kill()
    } else {
      this.node = fork('./index.js', { stdio: ['pipe', 'pipe', 'pipe', 'ipc'] })
      this.node.once('close', () => {
        this.node = false
        this.startNode()
      })
      this.node.stdout.on('data', (data) => {
        log.success(data.toString().trim())
      })
      this.node.stderr.on('data', (data) => {
        this.error = true
        this.handleError(data.toString().trim())
      })
      this.node.on('message', msg => {
        if (msg === 'app:ready') {
          log.success(`app:ready ${chalk.bold(Date.now() - startTime)}ms`)
        }
      })
    }
  },
  start () {
    chokidar.watch('./ios', { ignoreInitial: true })
      .on('all', (event, path) => this.startNode())

    chokidar.watch('./client', { ignoreInitial: true })
      .on('all', (event, path) => this.compileClient())

    this.startNode()
    this.compileClient()
  }
}

processes.start()
process.on('beforeExit', () => processes.node && processes.node.kill())
