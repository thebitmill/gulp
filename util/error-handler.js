'use strict'

const _ = require('lodash')
const util = require('gulp-util')
const chalk = require('chalk')
const serializeError = require('serialize-error')

const defaultOmitKeys = ['stack', 'name', 'message', 'plugin', 'task', 'showStack', 'showProperties', 'codeFrame']

module.exports = function (err) {
  if (err.task) {
    util.log(`${chalk.red(err.name || 'Error')} in task '${chalk.cyan(err.task)}'`)
  } else {
    util.log(`${chalk.red(err.name || 'Error')} in plugin '${chalk.cyan(err.plugin)}'`)
  }

  const omitKeys = defaultOmitKeys.slice(0)

  if (err.plugin === 'gulp-less') {
    omitKeys.push('__safety')
  }

  console.log(`\n${err.message}`)
  console.dir(_.omit(serializeError(err), omitKeys))
  console.log('')

  // needed for error handling not thrown by gulp-watch
  if (this && this.emit) {
    // Keep gulp from hanging on this task
    this.emit('end')
  }
}
