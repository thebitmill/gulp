'use strict';

// exit cleanly on Ctrl + C
process.on('SIGINT', () => {
  process.exit(0);
});

// modules > 3rd party
const _ = require('lodash');

// modules > gulp
const gulp = require('gulp');

global.ENV = process.env.NODE_ENV || 'development';
global.PWD = process.env.PWD;

const args = process.argv.slice(2);

// use tasks from arguments list if present, otherwise use tasks from
// configuration (environment specific)
let { tasks } = args.length > 0 ? args : require('./config');

// only require used tasks
_.flatten(tasks, true).forEach(task => require(`./tasks/${task}`));

tasks = tasks.map((task) => {
  if (Array.isArray(task)) {
    return gulp.parallel(...task);
  }

  return task;
});

// set up the 'default' task to use runSequence to run all tasks
gulp.task('default', gulp.series(...tasks));
