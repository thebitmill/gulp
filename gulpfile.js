'use strict'

// exit cleanly on Ctrl + C
process.on('SIGINT', () => {
  process.exit(0)
})

// modules > 3rd party
const _ = require('lodash')

// modules > gulp
const gulp = require('gulp')

process.env.NODE_ENV = process.env.NODE_ENV || 'development'

const args = process.argv.slice(2)

// use tasks from arguments list if present, otherwise use tasks from
// configuration (environment specific)
let tasks = args.length > 0 ? args : require('./config').tasks

// only require used tasks
_.flatten(tasks, true).forEach((task) => require(`./tasks/${task}`))

tasks = tasks.map((task) => {
  if (Array.isArray(task)) {
    return gulp.parallel(...task)
  }

  return task
})

// set up the 'default' task to use runSequence to run all tasks
gulp.task('default', gulp.series(...tasks))
