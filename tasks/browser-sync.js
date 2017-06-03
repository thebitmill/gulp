'use strict'

const gulp = require('gulp')
const browserSync = require('browser-sync')

const TASK_NAME = 'browser-sync'
const config = require('../config').browserSync

gulp.task(TASK_NAME, () => browserSync(config))
