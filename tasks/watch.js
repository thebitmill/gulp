'use strict';

// modules > 3rd party
const _ = require('lodash');

// modules > gulp:utilities
const gulp = require('gulp');

const TASK_NAME = 'watch';
const config = require('../config').watch;

gulp.task(TASK_NAME, () => {
  _.forIn(config, (value, key) => {
    gulp.watch(value, gulp.series(key));
  });
});
