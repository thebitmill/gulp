'use strict'

// native modules
const fs = require('fs')

// 3rd party modules
const mkdirp = require('mkdirp')
const chalk = require('chalk')
const gulp = require('gulp')
const gutil = require('gulp-util')
const rimraf = require('rimraf')

const TASK_NAME = 'wipe'

const config = require('../config').wipe

gulp.task(TASK_NAME, (cb) => {
  let count = 0
  config.src.forEach((folder) => {
    fs.exists(folder, (exists) => {
      if (exists) {
        rimraf(folder, (err) => {
          if (err) throw err
          gutil.log('Folder ' + chalk.magenta(folder) + ' removed')

          mkdirp.sync(folder)

          count++
          if (count >= config.src.length) {
            cb()
          }
        })
      } else {
        count++

        mkdirp.sync(folder)

        if (count >= config.src.length) {
          cb()
        }
      }
    })
  })
})
