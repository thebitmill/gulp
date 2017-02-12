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

// modules > rollup
const pluginConstructors = {
  babel: require('rollup-plugin-babel'),
  commonjs: require('rollup-plugin-commonjs'),
  nodeResolve: require('rollup-plugin-node-resolve'),
  replace: require('rollup-plugin-replace'),
};


const omitKeys = ['src', 'suffix', 'entries', 'entry', 'output', 'outputs'];

function task(entry, entryConfig, cb) {
  rollup(Object.assign(_.omit(entryConfig, omitKeys), {
    entry: p.join(entryConfig.src, entry),
    cache: cache[entry],
  }))
    .then((bundle) => {
      cache[entry] = bundle;

      const count = bundle.modules.filter((module) => !module.id.startsWith('\u0000commonjs-proxy')).length;

      gutil.log(`${chalk.cyan(TASK_NAME)} bundled ${chalk.blue(count)} files into ${chalk.magenta(entryConfig.output)}.`);

      bundle.write(Object.assign({
        // moduleName: output,
        dest: p.join(entryConfig.dest, entryConfig.output),
      // }, _.omit(entryConfig, omitKeys.slice(1))));
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


const tasks = config.entries.map((entry, index) => {
  let taskName;
  let entryConfig;
  let output;

  if (Array.isArray(entry)) {
    taskName = `${TASK_NAME}:${entry[0]}`;
    output = (entry[1].output || config.outputs && config.outputs[index]) || entry[0];
    entryConfig = _.merge(entry[1], _.omit(config, ['entries', 'outputs']));
    entry = entry[0];
  } else {
    taskName = `${TASK_NAME}:${entry}`;
    entryConfig = config;
    output = (entryConfig.outputs && entryConfig.outputs[index]) || entry;
  }


  const plugins = _.map(entryConfig.plugins, (pluginConfig, key) => {
    if (_.isPlainObject(pluginConfig)) {
      if (!pluginConstructors[key]) {
        throw new Error(`Unknown plugin "${key}"`);
      }

      return pluginConstructors[key](pluginConfig);
    }

    return pluginConfig;
  });

  gulp.task(taskName, task.bind(null, entry, Object.assign({}, entryConfig, { plugins, output })));

  return taskName;
});

gulp.task(TASK_NAME, gulp.parallel(tasks));
