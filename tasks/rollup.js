'use strict'

// modules > native
const p = require('path')
const fs = require('fs')

// modules > 3rd party
const _ = require('lodash')
const chalk = require('chalk')
const serializeError = require('serialize-error')

// modules > gulp
const gulp = require('gulp')
const gutil = require('gulp-util')
const { rollup } = require('rollup')
// const sourcemaps = require('gulp-sourcemaps')

// modules > local
const errorHandler = require('../util/error-handler')

const { rollup: config } = require('../config')

const TASK_NAME = 'rollup'

const cache = {}

config.inputs = config.inputs || [config.input]

/* TODO only rebuild changed bundle when watching.
 * should probably be done with gulp.watch(pattern, (file) => {})
 *
 * if (file && !_.isEmpty(cache)) {
 *  const filesInBundle = cache[].modules.map(input => input.id)
 *  if (filesInBundle.includes(file)) etc etc
 * }
 */

// modules > rollup
const pluginConstructors = {
  babel: require('rollup-plugin-babel'),
  commonjs: require('rollup-plugin-commonjs'),
  nodeResolve: require('rollup-plugin-node-resolve'),
  replace: require('rollup-plugin-replace'),
}

const omitKeys = [
  'dest',
  'src',
  'suffix',
  'inputs',
  'input',
  'output',
  'outputs',
]

function task (input, inputConfig, cb) {
  if (config.suffix) {
    fs.writeFile(`${config.dest}.json`, JSON.stringify({ suffix: config.suffix }))
  }

  rollup(Object.assign(_.omit(inputConfig, omitKeys), {
    input: p.join(inputConfig.src, input),
    cache: cache[input],
  }))
    .then((bundle) => {
      cache[input] = bundle

      const count = bundle.modules.filter((module) => !module.id.startsWith('\u0000commonjs-proxy')).length

      gutil.log(`${chalk.cyan(TASK_NAME)} bundled ${chalk.blue(count)} files into ${chalk.magenta(inputConfig.output)}.`)

      bundle.write(Object.assign({
        file: p.join(inputConfig.dest, inputConfig.output),
      }, _.omit(config, omitKeys)))

      cb()
    })
    .catch((err) => {
      err = Object.assign(serializeError(err), {
        task: `${TASK_NAME}:${input}`,
      })

      errorHandler(err)

      cb()
    })
}

const tasks = config.inputs.map((input, index) => {
  let taskName
  let inputConfig
  let output

  if (Array.isArray(input)) {
    taskName = `${TASK_NAME}:${input[0]}`
    output = (input[1].output || (config.outputs && config.outputs[index])) || input[0]
    inputConfig = _.mergeWith(_.omit(config, ['inputs', 'outputs']), input[1], (a, b) => (Array.isArray(a) ? b : undefined))
    input = input[0]
  } else {
    taskName = `${TASK_NAME}:${input}`
    inputConfig = config
    output = (inputConfig.outputs && inputConfig.outputs[index]) || input
  }

  if (config.suffix) {
    const obj = p.parse(output)
    obj.name += config.suffix
    delete obj.base
    output = p.format(obj)
  }

  const plugins = _.map(inputConfig.plugins, (pluginConfig, key) => {
    if (_.isPlainObject(pluginConfig)) {
      if (!pluginConstructors[key]) {
        throw new Error(`Unknown plugin "${key}"`)
      }

      return pluginConstructors[key](pluginConfig)
    }

    // assuming pluginConfig is actually an initialized plugin
    return pluginConfig
  })

  gulp.task(taskName, task.bind(null, input, Object.assign({}, inputConfig, { plugins, output })))

  return taskName
})

gulp.task(TASK_NAME, gulp.parallel(tasks))
