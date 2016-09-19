'use strict';

// modules > native
const p = require('path');

// modules > 3rd party
const chalk = require('chalk');

// modules > gulp:utilities
const gulp = require('gulp');
const gutil = require('gulp-util');

const TASK_NAME = 'raster';
const { raster: config } = require('../config');

gulp.task(TASK_NAME, () => {
  let count = 0;

  return gulp.src(config.src)
    .pipe(gulp.symlink(() => {
      count += 1;
      return p.join(config.dest);
    }, { log: false }))
    .on('end', () => {
      gutil.log(`${chalk.cyan(TASK_NAME)} done symlinking ${chalk.bold.blue(count)} files`);
    });
});
