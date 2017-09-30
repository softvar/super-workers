let webpack = require('webpack');
let createVariants = require('parallel-webpack').createVariants;

// Import the plugin:
let path = require('path');
let env = require('yargs').argv.env;
console.warn(env.mode);

let mode = env.mode;
const libraryName = 'super-workers';

let libVersion = JSON.stringify(require("./package.json").version);

let libraryHeaderComment =  '\n' +
  'super-workers ' + libVersion + '\n' +
  'https://github.com/softvar/super-workers.js\n' +
  'MIT LICENSE\n' +
  '\n' +
  'Copyright (C) 2017-2018 softvar - A project by Varun Malhotra(https://github.com/softvar)\n';


let plugins = [
  new webpack.BannerPlugin({
    banner: libraryHeaderComment,
    entryOnly: true
  })
];
let outputFile;

function createConfig(options) {
  return {
    entry: __dirname + '/src/index.js',
    devtool: 'source-map',
    output: {
      path: __dirname + '/dist',
      library: 'SuperWorkers',
      filename: libraryName + (options.target ? '.' + options.target : '') + (mode === 'build' ? '.min.js' : '.js'),
      libraryTarget: options.target || 'umd',
      umdNamedDefine: true
    },
    module: {
      rules: [{
        test: /(\.js)$/,
        exclude: /(node_modules)/,
        use: {
          // babel-loader to convert ES6 code to ES5 + amdCleaning requirejs code into simple JS code, taking care of modules to load as desired
          loader: 'babel-loader',
          options: {
            presets: ['env'],
            plugins: []
          }
        }
      }, {
        enforce: 'pre',
        test: /(.js)$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'eslint-loader',
          options: {
            emitError: true,
            emitWarning: true,
            failOnWarning: mode === 'build',
            failOnError: mode === 'build'
          }
        }
      }]
    },
    plugins: plugins
  };
}

// At the end of the file:
module.exports = createVariants({
    target: ['this', '']
}, createConfig);
