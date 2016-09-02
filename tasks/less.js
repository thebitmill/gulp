'use strict'

const fs = require('fs')
const gulp = require('gulp')
const _less = require('less')
const less = require('gulp-less')
const sourcemaps = require('gulp-sourcemaps')
const rename = require('gulp-rename')
const mkdirp = require('mkdirp')

const postcss = require('gulp-postcss')
const autoprefixer = require('autoprefixer')

const config = require('../config').less

const suffix = '-' + Date.now().toString(16)

const errorHandler = require('../util/error-handler')

_less.functions.functionRegistry.addMultiple(config.functions)

const processors = [
  autoprefixer(config.autoprefixer),
]

if (ENV === 'production') {
  const csswring = require('csswring')
  processors.push(csswring(config.csswring))
}

gulp.task('less', function () {
  mkdirp(config.dest)

  if (config.suffix)
    fs.writeFile(config.dest + '.json', JSON.stringify({ suffix }))

  let pipe = gulp.src(config.src)
    .pipe(sourcemaps.init())
    .pipe(less(config.options).on('error', errorHandler))
    .pipe(postcss(processors))

  if (config.suffix)
    pipe = pipe.pipe(rename({ suffix }))

  return pipe.pipe(sourcemaps.write('./maps'))
    .pipe(gulp.dest(config.dest))
})
