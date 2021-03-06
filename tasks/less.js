'use strict'

const fs = require('fs')
const gulp = require('gulp')
const lessModule = require('less')
const less = require('gulp-less')
const sourcemaps = require('gulp-sourcemaps')
const rename = require('gulp-rename')
const mkdirp = require('mkdirp')

const postcss = require('gulp-postcss')
const autoprefixer = require('autoprefixer')

const config = require('../config').less

const errorHandler = require('../util/error-handler')

lessModule.functions.functionRegistry.addMultiple(config.functions)

const processors = [
  autoprefixer(),
]

if (process.env.NODE_ENV === 'production') {
  const csswring = require('csswring')

  processors.push(csswring())
}

gulp.task('less', () => {
  mkdirp.sync(config.dest)

  if (config.suffix) {
    fs.writeFileSync(`${config.dest}.json`, JSON.stringify({ suffix: config.suffix }))
  }

  let pipe = gulp.src(config.src)
    .pipe(sourcemaps.init())
    .pipe(less(config.options).on('error', errorHandler))
    .pipe(postcss(processors))

  if (config.suffix) {
    pipe = pipe.pipe(rename({ suffix: config.suffix }))
  }

  return pipe.pipe(sourcemaps.write('./maps'))
    // .on('error', errorHandler)
    .pipe(gulp.dest(config.dest))
})
