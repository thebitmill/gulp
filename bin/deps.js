#!/bin/env node

'use strict';

const fs = require('fs');
const p = require('path');
const chalk = require('chalk');

const _ = require('lodash');

global.PWD = process.env.NODE_PWD || process.cwd();

const bounPrefix = `[${chalk.yellow('BOUN')}] `;
// const successPrefix = `[${chalk.green('SUCCESS')}] `;
// const errorPrefix = `[${chalk.red('ERROR')}] `;

function writePackage(pkg) {
  fs.writeFileSync(p.join(PWD, 'package.json'), JSON.stringify(pkg, null, '  ') + '\n');
}

function dependencies() {
  const gulpPkg = require(p.join(PWD, 'gulp/package.json'));
  const appPkg = require(p.join(PWD, 'package.json'));

  console.info(`${bounPrefix}Adding dependencies from ${chalk.green('gulp')}`);
  console.log(_.toPairs(gulpPkg.dependencies).map((arr) => (`- ${arr[0]}@${arr[1]}`)).join('\n'));

  Object.assign(appPkg.devDependencies, gulpPkg.dependencies);

  appPkg.devDependencies = _.fromPairs(_.toPairs(appPkg.devDependencies).sort((a, b) => {
    if (a[0] < b[0]) {
      return -1;
    }

    if (a[0] > b[0]) {
      return 1;
    }

    return 0;
  }));

  writePackage(appPkg);
}

return dependencies()
