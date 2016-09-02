'use strict'

const _ = require('lodash')

const gulp = require('gulp')
const browserSync = require('browser-sync')
const nodemon = require('nodemon')

const config = require('../config').nodemon

// for some reason, this was needed somewhere before
//process.stdout.isTTY = true

gulp.task('nodemon', (cb) => {
  nodemon(_.defaults({ stdout: false }, config))
    .on('log', function (log) {
      console.log(log.colour)
    })
    .on('readable', function () {
      this.stdout.pipe(process.stdout)
      this.stderr.pipe(process.stderr)

      this.stdout.on('data', (chunk) => {
        if (/HTTP server (running|listening|started) on|at port/i.test(chunk.toString('utf-8').trim())) {
          if (cb)
            cb()

          cb = null

          if (browserSync.active)
            browserSync.reload()
        }
      })
    })
})
