'use strict';

// modules > 3rd party
const _ = require('lodash');

// modules > gulp:utilities
const gulp = require('gulp');

// modules > gulp:plugins
const babel = require('gulp-babel');
const changed = require('../plugins/changed');

const errorHandler = require('../util/error-handler');
const { babel: config } = require('../config');
const merge = require('merge-stream');

function task(itemConfig) {
  return gulp.src(itemConfig.src)
    .pipe(changed())
    .pipe(babel(_.omit(itemConfig, 'src', 'dest')))
    .on('error', errorHandler)
    .pipe(gulp.dest(itemConfig.dest));
}

gulp.task('babel', () => {
  if (Array.isArray(config)) {
    return merge(config.map(task));
  }

  return task(config);
});
