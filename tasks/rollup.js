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

const omitKeys = [
  'dest',
  'entries',
  // 'input',
  'inputs',
  'merge',
  // 'output',
  'outputs',
  'src',
  'suffix',
]

function task (entry, cb) {
  // if (config.suffix) {
  //   fs.writeFile(`${config.dest}.json`, JSON.stringify({ suffix: config.suffix }), (err) => err && console.error(err))
  // }

  rollup(Object.assign(_.omit(entry, omitKeys), {
    cache: cache[entry.input],
  }))
    .then((bundle) => {
      cache[entry.input] = bundle

      const count = bundle.modules.filter((module) => !module.id.startsWith('\u0000commonjs-proxy')).length

      bundle.write(entry.output).then(() => {
        gutil.log(`${chalk.cyan(TASK_NAME)} bundled ${chalk.blue(count)} files into ${chalk.magenta(entry.output.file)}.`)

        cb()
      })
      // bundle.write(Object.assign(_.omit(config, omitKeys), {
      //   file: entry.output.file,
      // }))
    })
    .catch((err) => {
      err = Object.assign(serializeError(err), {
        task: `${TASK_NAME}:${entry.input}`,
      })

      errorHandler(err)

      cb()
    })
}

function createTask (entry) {
  if (entry.merge && !Array.isArray(config)) {
    entry = _.mergeWith({}, _.omit(config, [ 'entries', 'input', 'inputs', 'file', 'outputs' ]), entry, (a, b) => (Array.isArray(a) ? b : undefined))
  }

  // initialize all plugins. if the plugins property is an array, the plugins have already been initialized.
  const plugins = Array.isArray(entry.plugins) ? entry.plugins : _.map(entry.plugins, (pluginConfig, pluginName) => {
    pluginName = _.kebabCase(pluginName)

    if (_.isPlainObject(pluginConfig)) {
      let plugin

      try {
        plugin = require(pluginName)
      } catch (e) {
        try {
          plugin = require(`rollup-plugin-${pluginName}`)
        } catch (e) {
          throw new Error(`Unknown plugin "${pluginName}"`)
        }
      }

      return plugin(pluginConfig)
    }

    // if not a plainObject, assume pluginConfig is actually an initialized plugin
    return pluginConfig
  })

  if (Array.isArray(entry.inputs)) {
    return entry.inputs.map((input, i) => {
      if (!entry.outputs || !entry.outputs[i]) {
        throw new Error(`Output file not defined for "${input}"`)
      }

      const output = Object.assign({
        file: entry.outputs[i],
      }, entry.output)

      return createTask(Object.assign({}, _.omit(entry, [ 'entries', 'inputs', 'outputs', 'merge' ]), { input, output, plugins }))
    })
  }

  let input = entry.input
  let file = entry.file || entry.output.file

  if (entry.src || config.src) {
    input = p.join(entry.src || config.src, input)
  }

  if (entry.dest || config.dest) {
    file = p.join(entry.dest || config.dest, file)
  }

  const output = Object.assign({}, entry.output, { file })

  let taskName = `${TASK_NAME}:${entry.input}`

  gulp.task(taskName, task.bind(null, Object.assign({}, entry, { plugins, file: undefined, input, output })))

  return taskName
}

let entries = Array.isArray(config) ? config : config.entries || [ config ]

const tasks = entries.map(createTask)

gulp.task(TASK_NAME, gulp.parallel(_.flatten(tasks)))
