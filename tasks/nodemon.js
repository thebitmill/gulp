'use strict'

const _ = require('lodash')

const gulp = require('gulp')
const browserSync = require('browser-sync')
const nodemon = require('nodemon')

const config = require('../config').nodemon

// for some reason, this was needed somewhere before
// process.stdout.isTTY = true

gulp.task('nodemon', (cb) => {
  const done = _.once(cb)

  const stream = nodemon(_.defaults({ stdout: false }, config))
    .on('log', (log) => {
      console.info(log.colour)
    })
    .on('readable', () => {
      stream.stdout.pipe(process.stdout)
      stream.stderr.pipe(process.stderr)

      stream.stdout.on('data', (chunk) => {
        if (/HTTP server (running|listening|started) on|at port/i.test(chunk.toString('utf-8').trim())) {
          done()

          if (browserSync.active) {
            browserSync.reload()
          }
        }
      })
    })
})
