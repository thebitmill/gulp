'use strict';

// modules > native
const p = require('path');

// modules > gulp:utilities
const gulp = require('gulp');

// modules > gulp:plugins
const babel = require('gulp-babel');
const changed = require('../plugins/changed');
const rename = require('gulp-rename');

const { babel: config } = require('../config');

gulp.task('babel', () => (
  gulp.src(config.src)
    .pipe(changed())
    .pipe(rename((path) => {
      if (path.extname === '.jsx') {
        path.basename += '.jsx';
        path.extname = '.js';
      }
    }))
    .pipe(babel(config.babel))
    .pipe(gulp.dest(config.dest))
));
