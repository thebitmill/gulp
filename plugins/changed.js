'use strict';

const through = require('through2');

const mtimes = {};

function compareLastModifiedTime(stream, cb, sourceFile) {
  const path = sourceFile.path;

  const mtime = mtimes[path];

  if (!mtime || sourceFile.stat.mtime > mtime) {
    stream.push(sourceFile);

    mtimes[path] = sourceFile.stat.mtime;
  }

  return cb();
}

module.exports = (opts = {}) => {
  opts.hasChanged = opts.hasChanged || compareLastModifiedTime;

  return through.obj(function (file, enc, cb) {
    opts.hasChanged(this, cb, file);
  });
};
