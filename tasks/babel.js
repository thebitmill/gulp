'use strict';

// modules > gulp:utilities
const gulp = require('gulp');

// modules > gulp:plugins
const babel = require('gulp-babel');
const changed = require('../plugins/changed');

const errorHandler = require('../util/error-handler');
const { babel: config } = require('../config');
const merge = require('merge-stream');

gulp.task('babel', () => {
  if (Array.isArray(config)) {
    return merge(config.map((config) => (
      gulp.src(config.src)
        .pipe(changed())
        .pipe(babel(config.babel))
        .on('error', errorHandler)
        .pipe(gulp.dest(config.dest))
    )));
  }

  return gulp.src(config.src)
    .pipe(changed())
    .pipe(babel(config.babel))
    .on('error', errorHandler)
    .pipe(gulp.dest(config.dest));
});
