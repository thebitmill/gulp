'use strict'

// modules > native
const p = require('path')

//modules > 3rd party
const chalk = require('chalk')
const _ = require('lodash')

// modules > gulp
const gutil = require('gulp-util')

const localConfigPath = p.join(process.cwd(), 'gulpconfig.js')

try {
  const localConfig = require(localConfigPath)

  module.exports = _.mergeWith(require('./default-config'), localConfig, (a, b) => Array.isArray(a) ? b : undefined)

  gutil.log('Local ' + chalk.magenta('gulpconfig.js') + ' found and loaded')
} catch (e) {
  if (e.message && !e.message.startsWith('Cannot find module'))
    throw e

  module.exports = require('./default-config')

  gutil.log(chalk.red.bold('Warning!') + ' Local ' + chalk.magenta('gulpconfig.js') + ' not found, using default config instead.')
}
