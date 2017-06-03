'use strict'

// modules > 3rd party
const _ = require('lodash')
const p = require('path')

// modules > gulp:utilities
const gulp = require('gulp')

const TASK_NAME = 'watch'
const { watch, rollup } = require('../config')

gulp.task(TASK_NAME, () => {
  _.forIn(watch, (value, key) => {
    if (value) gulp.watch(value, gulp.series(key))
  })

  _.forEach(rollup.entries, (entry) => {
    const filename = Array.isArray(entry) ? entry[0] : entry
    const dir = p.dirname(p.join(rollup.src, filename))
    gulp.watch(`${p.resolve(dir)}/**/*.{js,jsx}`, gulp.series(`rollup:${filename}`))
  })
})
