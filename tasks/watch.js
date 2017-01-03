'use strict';

// modules > 3rd party
const _ = require('lodash');
const p = require('path');

// modules > gulp:utilities
const gulp = require('gulp');

const TASK_NAME = 'watch';
const { watch, rollup } = require('../config');

gulp.task(TASK_NAME, () => {
  _.forIn(watch, (value, key) => {
    if (value) gulp.watch(value, gulp.series(key));
  });

  _.forEach(rollup.entries, (entry) => {
    gulp.watch(`${p.dirname(p.resolve(entry))}/**/*.{js,jsx}`, gulp.series(`rollup:${entry}`));
  });
});
