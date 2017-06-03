#!/bin/env node

'use strict'

const fs = require('fs')
const p = require('path')
const chalk = require('chalk')

const _ = require('lodash')

const projectRoot = p.resolve(__dirname, '../..')

const bounPrefix = `[${chalk.yellow('BOUN')}] `

function writePackage (pkg) {
  fs.writeFileSync(p.join(projectRoot, 'package.json'), `${JSON.stringify(pkg, null, '  ')}\n`)
}

function dependencies () {
  const gulpPkg = require(p.join(projectRoot, 'gulp/package.json'))
  const appPkg = require(p.join(projectRoot, 'package.json'))

  console.info(`${bounPrefix}Adding dependencies from ${chalk.green('gulp')}`)
  console.log(_.toPairs(gulpPkg.dependencies).map((arr) => (`- ${arr[0]}@${arr[1]}`)).join('\n'))

  appPkg.devDependencies = Object.assign(appPkg.devDependencies || {}, gulpPkg.dependencies)

  appPkg.devDependencies = _.fromPairs(_.toPairs(appPkg.devDependencies).sort((a, b) => {
    if (a[0] < b[0]) {
      return -1
    }

    if (a[0] > b[0]) {
      return 1
    }

    return 0
  }))

  writePackage(appPkg)
}

dependencies()
