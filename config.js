'use strict'

const p = require('path')

const chalk = require('chalk')

const gutil = require('gulp-util')

const localConfig = p.join(process.cwd(), 'gulpconfig.js')

try {
  module.exports = require(localConfig)
  gutil.log('Local ' + chalk.magenta('gulpconfig.js') + ' found and loaded')
} catch (e) {
  if (e.message && !e.message.startsWith('Cannot find module'))
    throw e

  module.exports = require('./default-config')

  gutil.log(chalk.red.bold('Warning!') + ' Local ' + chalk.magenta('gulpconfig.js') + ' not found, using default config instead.')
}
