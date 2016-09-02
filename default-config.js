'use strict'

// modules > native
const p = require('path')
const fs = require('fs')

// modules > rollup
const babel = require('rollup-plugin-babel')
const commonjs = require('rollup-plugin-commonjs')
const nodeResolve = require('rollup-plugin-node-resolve')
const marko = require('rollup-plugin-marko')

const port = fs.existsSync(p.join(PWD, 'server/config/port.js')) ?
  require(p.join(PWD, 'server/config/port')) : null

module.exports = {
  browserSync: {
    browser: null,
    ghostMode: false,
    proxy: 'localhost:' + (port || 3000),
    port: 1337,
    ui: {
      port: 1338
    },
    files: [
      p.join(PWD, 'public/css/**/*.css'),
      p.join(PWD, 'public/js/**/*.js'),
    ]
  },

  browserify: {
    suffix: true,
    debug: true,
    dest: p.join(PWD, 'public/js'),
    extensions: [ '.js', '.jsx', '.json' ],
    // PWD/node_modules is added so symlinked ridge does not break. used to
    // work without this in browserify 9
    paths: [ p.join(PWD, 'node_modules'), p.join(PWD, 'modules') ],
    // outputs only need to be used if output names are different from entries.
    // Otherwise the entries array is copied into the outputs array.
    entries: [
      'src/app.js',
      'src-widget/widget.js'
    ],
    src: p.join(PWD, 'src')
  },

  less: {
    suffix: true,
    src: [
      p.join(PWD, 'less/*.less')
    ],
    dest: p.join(PWD, 'public/css'),
    autoprefixer: {
      browsers: [
        'safari >= 5',
        'ie >= 8',
        'ios >= 6',
        'opera >= 12.1',
        'firefox >= 17',
        'chrome >= 30',
        'android >= 4'
      ],
      cascade: true
    },
    functions: require(p.join(process.cwd(), 'gulp/less/functions')),
    options: {
      paths: [
        p.join(PWD, 'node_modules/spineless/less')
      ],
    }
  },

  nodemon: {
    ext: 'js,jade,marko',
    ignore: [ '*.marko.js' ],
    watch: [ 'server' ],
    script: fs.existsSync(p.join(PWD, 'package.json')) ? require(p.join(PWD, 'package.json')).main.replace(/^\./, PWD) : 'server/server.js',
    env: {
      BABEL_ENV: 'server',
      // what port you actually put into the browser... when using browser-sync
      // this will differ from the internal port used by express
      EXTERNAL_PORT: 1337,
      // needed to force debug to use colors despite tty.istty(0) being false,
      // which it is in a child process
      DEBUG_COLORS: true,
      // needed to force chalk to use when running gulp nodemon tasks.
      FORCE_COLOR: true,
      PWD,
      NODE_ENV: ENV,
      DEBUG: 'newseri:*'
    }
  },

  raster: {
    src: p.join(PWD, 'img/raster/**/*.{png,gif,jpg}'),
    dest: p.join(PWD, 'public/img')
  },

  rollup: {
    suffix: true,
    plugins: [
      marko(),
      babel({
        exclude: 'node_modules/**'
      }),
      nodeResolve({
        jsnext: true,  // Default: false
        main: true,  // Default: true
        browser: true,  // Default: false
        preferBuiltins: false
      }),

      commonjs({
        include: [ 'node_modules/**', 'src-admin/**/*.marko', 'src-admin/**/*.marko.js'],
        exclude: [ 'node_modules/lodash-es/**' ],
        extensions: [ '.js', '.marko' ],
        sourceMap: true,  // Default: true
        namedExports: {
          'node_modules/react/react.js': ['PropTypes', 'createElement']
        }
      }),
    ],
    sourceMap: true,
    dest: p.join(PWD, 'public/js'),
    entries: [
      'src/app.js'
    ],
    outputs: [
      'app.js'
    ],
    format: 'iife',
  },

  static: {
    src: p.join(PWD, 'static/**/*'),
    dest: p.join(PWD, 'public')
  },

  svg: {
    src: p.join(PWD, 'img/svg/**/*.svg'),
    dest: p.join(PWD, 'public/img')
  },

  tasks: {
    development: [ 'wipe', [ 'raster', 'less', 'rollup', 'static', 'svg' ], [ 'nodemon' ], [ 'watch', 'browser-sync' ] ],
    production: [ 'wipe', [ 'raster', 'less', 'rollup', 'static', 'svg' ]]
  }[ENV],

  watch: {
    //sass: p.join(PWD, 'sass/**/*.{sass,scss}')
    less: p.join(PWD, 'less/**/*.less')
  },

  wipe: {
    src: [ p.join(PWD, 'public') ]
  },
}
