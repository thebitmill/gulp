'use strict'

// modules > native
const p = require('path')
const fs = require('fs')

const projectRoot = p.dirname(__dirname)

const port = fs.existsSync(p.join(projectRoot, 'server/config/port.js'))
  ? require(p.join(projectRoot, 'server/config/port')) : null

const suffix = `-${Date.now().toString(16)}`

module.exports = {
  babel: {
    src: 'client/**/*.{js,jsx}',
    dest: 'build',
    presets: ['es2015-node6', 'es2016', 'es2017', 'stage-0'],
    plugins: [
      'add-module-exports',
      ['transform-react-jsx', { pragma: 'h' }],
      ['module-resolver', {
        alias: {
          'easy-tz': 'easy-tz/cjs',
          lowline: 'lodash',
          'mini-qs': 'querystring',
          preact: 'jsx-node',
        },
      }],
    ],
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
      p.join(projectRoot, 'public/css/**/*.css'),
      p.join(projectRoot, 'public/js/**/*.js'),
    ],
  },

  less: {
    suffix,
    src: [
      p.join(projectRoot, 'assets/less/*.less'),
    ],
    dest: p.join(projectRoot, 'public/css'),
    functions: require(p.join(process.cwd(), 'gulp/less/functions')),
    options: {
      paths: [
        p.join(projectRoot, 'node_modules/spineless/less'),
      ],
    },
  },

  nodemon: {
    ext: 'js,jsx,marko',
    ignore: '*.marko.js',
    watch: [
      'server',
    ],
    script: fs.existsSync(p.join(projectRoot, 'package.json')) ? require(p.join(projectRoot, 'package.json')).main.replace(/^\./, projectRoot) : 'server/server.js',
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
      projectRoot,
      NODE_ENV: process.env.NODE_ENV,
      // DEBUG: 'midwest:*'
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
    src: p.join(projectRoot, 'assets/raster/**/*.{png,gif,jpg}'),
    dest: p.join(projectRoot, 'public/img'),
  },

  rollup: {
    suffix,
    plugins: {
      babel: {
        include: [
          'node_modules/preact/**',
          'node_modules/comkit-preact/**',
          'client/**',
        ],
        presets: ['es2015-rollup', 'es2016', 'es2017', 'stage-0'],
        plugins: [
          ['transform-react-jsx', { pragma: 'h' }],
        ],
      },

      replace: {
        'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV),
      },

      nodeResolve: {
        module: true, // Default: true
        jsnext: true, // Default: false
        main: true, // Default: true
        browser: true, // Default: false
        preferBuiltins: false,
        extensions: ['.js', '.jsx'],
        customResolveOptions: {
          // this option is set to ensure symlinked packages still resolve
          // packages in projects node_modules
          moduleDirectory: p.join(process.cwd(), 'node_modules'),
        },
      },

      commonjs: {
        include: [
          p.join(projectRoot, 'node_modules/**'),
        ],
        exclude: [
          p.join(projectRoot, 'node_modules/lodash-es/**'),
          p.join(projectRoot, 'node_modules/symbol-observable/**'),
        ],
        extensions: ['.js'],
        sourceMap: true, // Default: true
        namedExports: {
          'node_modules/react/index.js': ['Component', 'Children', 'PropTypes', 'createElement'],
        },
      },
    },
    sourcemap: true,
    src: p.join(projectRoot, 'client'),
    dest: p.join(projectRoot, 'public/js'),
    entries: [
      'app.js',
    ],
    outputs: [
      'app.js',
    ],
    format: 'iife',
  },

  sass: {
    src: p.join(projectRoot, 'assets/sass/*.{sass,scss}'),
    dest: p.join(projectRoot, 'public/css'),
    suffix,
    options: {
      outputStyle: 'nested',
      includePaths: [
        p.join(projectRoot, 'node_modules/spysass/sass'),
        p.join(projectRoot, 'node_modules/susy/sass'),
        p.join(projectRoot, 'node_modules/breakpoint-sass/sass'),
      ],
      imagePath: '../img',
    },
  },

  static: {
    src: p.join(projectRoot, 'assets/static/**/*'),
    dest: p.join(projectRoot, 'public'),
  },

  svg: {
    src: p.join(projectRoot, 'assets/svg/**/*.svg'),
    dest: p.join(projectRoot, 'public/img'),
  },

  tasks: {
    development: ['wipe', ['babel', 'raster', 'less', 'rollup', 'static', 'svg', 'video'], ['nodemon'], ['watch', 'browser-sync']],
    staging: ['wipe', ['babel', 'raster', 'less', 'rollup', 'static', 'svg', 'video']],
    production: ['wipe', ['babel', 'raster', 'less', 'rollup', 'static', 'svg', 'video']],
  }[process.env.NODE_ENV],

  video: {
    src: p.join(projectRoot, 'assets/video/**/*'),
    dest: p.join(projectRoot, 'public/video'),
  },

  watch: {
    babel: p.join(projectRoot, 'client/**/*.{js,jsx}'),
    less: p.join(projectRoot, 'assets/less/**/*.less'),
  },

  wipe: {
    src: [
      p.join(projectRoot, 'build'),
      p.join(projectRoot, 'public'),
    ],
  },
}
