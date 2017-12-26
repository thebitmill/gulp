'use strict'

// modules > 3rd party
const _ = require('lodash')
const p = require('path')

// modules > gulp:utilities
const gulp = require('gulp')

const TASK_NAME = 'watch'
const { watch, rollup } = require('../config')

function watchRollup (filename, root) {
  const path = p.resolve(root ? p.join(root, filename) : filename)

  gulp.watch(`${p.dirname(path)}/**/*.{js,jsx}`, gulp.series(`rollup:${filename}`))
}

gulp.task(TASK_NAME, () => {
  _.forIn(watch, (value, key) => {
    if (value) gulp.watch(value, gulp.series(key))
  })

  const entries = Array.isArray(rollup) ? rollup : rollup.entries || [ rollup ]

  entries.forEach((entry) => {
    const root = entry.src || rollup.src

    if (entry.inputs) {
      return entry.inputs.map((input) => watchRollup(input, root))
    }

    watchRollup(entry.input, root)
  })
})
