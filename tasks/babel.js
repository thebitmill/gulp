'use strict';

// modules > gulp:utilities
const gulp = require('gulp');

// modules > gulp:plugins
const babel = require('gulp-babel');
const changed = require('../plugins/changed');

const { babel: config } = require('../config');

gulp.task('babel', () => (
  gulp.src(config.src)
    .pipe(changed())
    .pipe(babel(config.babel))
    .pipe(gulp.dest(config.dest))
));
