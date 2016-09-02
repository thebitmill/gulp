'use strict'

const util = require('gulp-util')
const chalk = require('chalk')

module.exports = function (err) {
  util.log(chalk.red('ERROR') + (err.task ? ' in task \'' + chalk.cyan(err.task) : ' in plugin \'' + chalk.cyan(err.plugin)) + '\'')

  console.log('\n' + err.message.trim() + '\n')

  // needed for error handling not thrown by gulp-watch
  if (this.emit) {
    // Keep gulp from hanging on this task
    this.emit('end')
  }
}
