'use strict';

const util = require('gulp-util');
const chalk = require('chalk');

module.exports = (err) => {
  if (err.task) {
    util.log(`${chalk.red('ERROR')} in task '${chalk.cyan(err.task)}'`);
  } else {
    util.log(`${chalk.red('ERROR')} in plugin '${chalk.cyan(err.plugin)}'`);
  }

  console.info(`\n${err.message.trim()}\n`);

  // needed for error handling not thrown by gulp-watch
  if (this.emit) {
    // Keep gulp from hanging on this task
    this.emit('end');
  }
};
