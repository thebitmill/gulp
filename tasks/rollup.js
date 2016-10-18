'use strict';

// modules > native
const p = require('path');
const fs = require('fs');

// modules > 3rd party
const _ = require('lodash');
const chalk = require('chalk');

// modules > gulp
const gulp = require('gulp');
const gutil = require('gulp-util');
const { rollup } = require('rollup');
// const sourcemaps = require('gulp-sourcemaps')

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
  const output = (config.outputs && config.outputs[index]) || entry.replace(/^[^\/]+\//, '');

  rollup(Object.assign(_.omit(config, 'suffix', 'entries', 'entry', 'outputs'), {
    entry,
    cache: cache[entry],
  }))
    .catch((err) => {
      // TODO make this not exit gulp process
      cb(new gutil.PluginError(TASK_NAME, err));
    })
    .then((bundle) => {
      cache[entry] = bundle;

      const count = bundle.modules.filter(module => !module.id.startsWith('\u0000commonjs-proxy')).length;

      gutil.log(`${chalk.cyan(TASK_NAME)} bundled ${chalk.blue(count)} files into ${chalk.magenta(output)}.`);

      bundle.write(Object.assign({
        moduleName: output,
        dest: p.join(config.dest, output),
      }, _.omit(config, 'suffix', 'dest', 'entries', 'entry', 'outputs')));

      cb();
    });
}

const tasks = [];

config.entries.forEach((entry, index) => {
  const taskName = `${TASK_NAME}:${entry}`;
  tasks.push(taskName);
  gulp.task(taskName, task.bind(null, entry, index));
});

gulp.task(TASK_NAME, gulp.parallel(tasks));
