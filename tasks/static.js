'use strict'

// modules > native
const p = require('path')
const fs = require('fs')

// modules > 3rd party
const chalk = require('chalk')

// modules > gulp:utilities
const gulp = require('gulp')
const through = require('through2')
const gutil = require('gulp-util')

const TASK_NAME = 'static'
const config = require('../config').static

gulp.task(TASK_NAME, () => {
  let count = 0

  return gulp.src(config.src)
    // we use through so that we can skip directories
    // we skip directories because we want to merge file structure
    .pipe(through.obj((file, enc, callback) => {
      fs.stat(file.path, (err, stats) => {
        if (stats.isDirectory())
          file = null

        callback(null, file)
      })
    }))
    .pipe(gulp.symlink((file) => {
      count++
      return p.join(config.dest)
    }))
    .on('end', () => {
      gutil.log(chalk.cyan(TASK_NAME) + ' done symlinking ' + chalk.bold.blue(count) + ' files')
    })
})
