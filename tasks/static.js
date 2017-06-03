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
const rename = require('gulp-rename')

const TASK_NAME = 'static'
const config = require('../config').static

gulp.task(TASK_NAME, () => {
  let count = 0

  return gulp.src(config.src)
    // we use through so that we can skip directories
    // we skip directories because we want to merge file structure
    .pipe(through.obj((file, enc, callback) => {
      const obj = p.parse(file.path)

      if ((obj.base === 'robots.txt' && process.env.NODE_ENV === 'production') || (obj.base === 'robots-production.txt' && process.env.NODE_ENV !== 'production')) {
        return callback(null, null)
      }

      // for vfs.dest (aka gulp.dest): "If the file has a symlink attribute
      // specifying a target path, then a symlink will be created."
      file.symlink = file.path

      fs.stat(file.path, (err, stats) => {
        if (err) return console.log(err)
        // do not symlink directories
        callback(null, stats.isDirectory() ? null : file)
      })
    }))
    .pipe(rename((path) => {
      count += 1

      if (/^robots/.test(path.basename)) {
        path.basename = 'robots'
      }

      return path
    }))
    .pipe(gulp.dest(config.dest))
    .on('end', () => {
      gutil.log(`${chalk.cyan(TASK_NAME)} done symlinking ${chalk.bold.blue(count)} files`)
    })
})
