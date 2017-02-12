'use strict';


// modules > native
const p = require('path');
const fs = require('fs');

const port = fs.existsSync(p.join(PWD, 'server/config/port.js')) ?
  require(p.join(PWD, 'server/config/port')) : null;

const babelrc = JSON.parse(fs.readFileSync(p.join(PWD, '.babelrc')));

const suffix = `-${Date.now().toString(16)}`;

module.exports = {
  babel: {
    src: 'client/**/*.{js,jsx}',
    dest: 'build',
    babel: babelrc.env['node-jsx'],
  },

  browserSync: {
    browser: null,
    ghostMode: false,
    proxy: `localhost:${port || 3000}`,
    port: 1337,
    ui: {
      port: 1338,
    },
    files: [
      p.join(PWD, 'public/css/**/*.css'),
      p.join(PWD, 'public/js/**/*.js'),
    ],
  },

  less: {
    suffix,
    src: [
      p.join(PWD, 'assets/less/*.less'),
    ],
    dest: p.join(PWD, 'public/css'),
    functions: require(p.join(process.cwd(), 'gulp/less/functions')),
    options: {
      paths: [
        p.join(PWD, 'node_modules/spineless/less'),
      ],
    },
  },

  nodemon: {
    ext: 'js,jsx,marko',
    ignore: '*.marko.js',
    watch: [
      'server',
    ],
    script: fs.existsSync(p.join(PWD, 'package.json')) ? require(p.join(PWD, 'package.json')).main.replace(/^\./, PWD) : 'server/server.js',
    env: {
      BABEL_ENV: 'node',
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
      //DEBUG: 'midwest:*'
    },
  },

  postcss: {
    autoprefixer: {
      browsers: [
        'safari >= 5',
        'ie >= 8',
        'ios >= 6',
        'opera >= 12.1',
        'firefox >= 17',
        'chrome >= 30',
        'android >= 4',
      ],
      cascade: true,
    },
  },

  raster: {
    src: p.join(PWD, 'assets/raster/**/*.{png,gif,jpg}'),
    dest: p.join(PWD, 'public/img'),
  },

  rollup: {
    suffix,
    plugins: {
      babel: babelrc.env.rollup,
      replace: {
        'process.env.NODE_ENV': JSON.stringify(ENV),
      },

      nodeResolve: {
        jsnext: true,  // Default: false
        main: true,  // Default: true
        browser: true,  // Default: false
        preferBuiltins: false,
        extensions: ['.js', '.jsx'],
      },

      commonjs: {
        include: [
          p.join(PWD, 'node_modules/**'),
        ],
        exclude: [
          p.join(PWD, 'node_modules/lodash-es/**'),
          p.join(PWD, 'node_modules/symbol-observable/**'),
        ],
        extensions: ['.js'],
        sourceMap: true,  // Default: true
        namedExports: {
          'node_modules/react/react.js': ['Component', 'Children', 'PropTypes', 'createElement'],
        },
      },
    },
    sourceMap: true,
    src: p.join(PWD, 'client'),
    dest: p.join(PWD, 'public/js'),
    entries: [
      'app.js',
    ],
    outputs: [
      'app.js',
    ],
    format: 'iife',
  },

  sass: {
    src: p.join(PWD, 'assets/sass/*.{sass,scss}'),
    dest: p.join(PWD, 'public/css'),
    suffix,
    options: {
      outputStyle: 'nested',
      includePaths: [
        p.join(PWD, 'node_modules/spysass/sass'),
        p.join(PWD, 'node_modules/susy/sass'),
        p.join(PWD, 'node_modules/breakpoint-sass/sass'),
      ],
      imagePath: '../img',
    },
  },

  static: {
    src: p.join(PWD, 'assets/static/**/*'),
    dest: p.join(PWD, 'public'),
  },

  svg: {
    src: p.join(PWD, 'assets/svg/**/*.svg'),
    dest: p.join(PWD, 'public/img'),
  },

  tasks: {
    development: ['wipe', ['babel', 'raster', 'less', 'rollup', 'static', 'svg', 'video'], ['nodemon'], ['watch', 'browser-sync']],
    staging: ['wipe', ['babel', 'raster', 'less', 'rollup', 'static', 'svg', 'video']],
    production: ['wipe', ['babel', 'raster', 'less', 'rollup', 'static', 'svg', 'video']],
  }[ENV],

  video: {
    src: p.join(PWD, 'assets/video/**/*'),
    dest: p.join(PWD, 'public/video'),
  },

  watch: {
    babel: p.join(PWD, 'client/**/*.{js,jsx}'),
    less: p.join(PWD, 'assets/less/**/*.less'),
  },

  wipe: {
    src: [
      p.join(PWD, 'build'),
      p.join(PWD, 'public'),
    ],
  },
};
