'use strict';

// modules > native
const p = require('path');

// modules > 3rd party
const _ = require('lodash');
const chalk = require('chalk');

// modules > gulp
const gulp = require('gulp');
const gutil = require('gulp-util');
const { rollup } = require('rollup');
// const sourcemaps = require('gulp-sourcemaps')

const { rollup: config } = require('../config');

process.env.BABEL_ENV = 'rollup';

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
gulp.task(TASK_NAME, (cb) => {
  let count = 0;

  function done(err) {
    if (err) cb(err);

    count += 1;

    if (count >= config.entries.length) {
      cb();
    }
  }

  config.entries.forEach((entry, index) => {
    const output = (config.outputs && config.outputs[index]) || entry.replace(/^[^\/]+\//, '');

    rollup(Object.assign(_.omit(config, 'suffix', 'entries', 'entry', 'outputs'), {
      entry,
      cache: cache[entry],
    }))
      .catch((err) => {
        // TODO make this not exit gulp process
        done(new gutil.PluginError(TASK_NAME, err));
      })
      .then((bundle) => {
        cache[entry] = bundle;

        gutil.log(`${chalk.cyan(TASK_NAME)} bundled ${chalk.blue(bundle.modules.length)} modules into ${chalk.magenta(output)}.`);

        bundle.write(Object.assign({
          dest: p.join(config.dest, output),
        }, _.omit(config, 'dest')));

        done();
      });
  });
});
