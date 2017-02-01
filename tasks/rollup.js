'use strict';

// modules > native
const p = require('path');

// modules > 3rd party
const _ = require('lodash');
const chalk = require('chalk');
const serializeError = require('serialize-error');

// modules > gulp
const gulp = require('gulp');
const gutil = require('gulp-util');
const { rollup } = require('rollup');
// const sourcemaps = require('gulp-sourcemaps')

// modules > local
const errorHandler = require('../util/error-handler');

const { rollup: config } = require('../config');

const TASK_NAME = 'rollup';

const cache = {};

config.entries = config.entries || [config.entry];

/* TODO only rebuild changed bundle when watching.
 * should probably be done with gulp.watch(pattern, (file) => {})
 *
 * if (file && !_.isEmpty(cache)) {
 *  const filesInBundle = cache[].modules.map(entry => entry.id)
 *  if (filesInBundle.includes(file)) etc etc
 * }
 */

function task(entry, index, cb) {
  const output = (config.outputs && config.outputs[index]) || entry;

  rollup(Object.assign(_.omit(config, 'src', 'suffix', 'entries', 'entry', 'outputs'), {
    entry: p.join(config.src, entry),
    cache: cache[entry],
  }))
    .then((bundle) => {
      cache[entry] = bundle;

      const count = bundle.modules.filter((module) => !module.id.startsWith('\u0000commonjs-proxy')).length;

      gutil.log(`${chalk.cyan(TASK_NAME)} bundled ${chalk.blue(count)} files into ${chalk.magenta(output)}.`);

      bundle.write(Object.assign({
        // moduleName: output,
        dest: p.join(config.dest, output),
      }, _.omit(config, 'suffix', 'dest', 'entries', 'entry', 'outputs')));

      cb();
    })
    .catch((err) => {
      err = Object.assign(serializeError(err), {
        task: `${TASK_NAME}:${entry}`,
      });

      errorHandler(err);

      cb();
    })
    ;
}

const tasks = [];

config.entries.forEach((entry, index) => {
  const taskName = `${TASK_NAME}:${entry}`;
  tasks.push(taskName);
  gulp.task(taskName, task.bind(null, entry, index));
});

gulp.task(TASK_NAME, gulp.parallel(tasks));
