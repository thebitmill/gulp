'use strict';

// modules > native
const fs = require('fs');

// modules > gulp
const gulp = require('gulp');
const sass = require('gulp-sass');
const postcss = require('gulp-postcss');
const autoprefixer = require('autoprefixer');

const sourcemaps = require('gulp-sourcemaps');
const rename = require('gulp-rename');

const { sass: sassConfig, postcss: postcssConfig } = require('../config');

const errorHandler = require('../util/error-handler');

function sassErrorHandler(err) {
  if (err.plugin === 'gulp-sass') {
    // node-sass currently outpus current file as first line of error message
    const path = err.message.match(/^.*\n/)[0];

    err.message = err.message.slice(path.length + 7);

    // when main file, ie main.scss throws an error the node-sass error
    // will say stdin instead of the actual filename.
    if (/\sstdin\s/.test(err.message))
      err.message = err.message.replace(/\sstdin\s/, path);
  }

  err.task = 'sass';

  errorHandler.call(this, err);
}

const processors = [
  autoprefixer(postcssConfig.autoprefixer),
];

if (ENV === 'production') {
  const csswring = require('csswring');
  processors.push(csswring(postcss.csswring));
}

gulp.task('sass', () => {
  if (sassConfig.suffix)
    fs.writeFile(sassConfig.dest + '.json', JSON.stringify({ suffix: sassConfig.suffix }));

  let pipe = gulp.src(sassConfig.src)
    .pipe(sourcemaps.init())
    .pipe(sass(sassConfig.options).on('error', sassErrorHandler))
    .pipe(postcss(processors));

  if (sassConfig.suffix)
    pipe = pipe.pipe(rename({ suffix: sassConfig.suffix }));

  return pipe.pipe(sourcemaps.write('./maps'))
    .pipe(gulp.dest(sassConfig.dest));
});
