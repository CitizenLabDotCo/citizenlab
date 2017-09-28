/**
 * COMMON WEBPACK CONFIGURATION
 */

const path = require('path');
const webpack = require('webpack');

module.exports = (options) => ({
  entry: options.entry,
  output: Object.assign({ // Compile into js/build.js
    path: path.resolve(process.cwd(), 'build'),
    publicPath: '/',
  }, options.output), // Merge with env dependent settings
  module: {
    loaders: [{
      test: /\.js$/, // Transform all .js files required somewhere with Babel
      loader: 'babel-loader',
      exclude: /node_modules/,
      query: options.babelQuery,
    }, {
      test: /\.ts(x?)$/,
      exclude: /node_modules/,
      loader: ['babel-loader', 'ts-loader'],
    }, {

      // Do not transform vendor's CSS with CSS-modules
      // The point is that they remain in global scope.
      // Since we require these CSS files in our JS or CSS files,
      // they will be a part of our compilation either way.
      // So, no need for ExtractTextPlugin here.
      test: /\.css$/,
      include: /node_modules/,
      loaders: ['style-loader', 'css-loader'],
    }, {
      test: /\.scss$/,
      exclude: /node_modules/,
      loaders: ['style-loader', 'css-loader', 'sass-loader'],
    }, {
      test: /\.(eot|svg|ttf|woff|woff2|jpg|png|gif)$/,
      loader: 'file-loader',
    },
    // {
    //   test: /\.(jpg|png|gif)$/,
    //   loaders: [
    //     'file-loader',
    //     {
    //       loader: 'image-webpack-loader',
    //       query: {
    //         mozjpeg: {
    //           progressive: true,
    //         },
    //         gifsicle: {
    //           interlaced: false,
    //         },
    //         optipng: {
    //           optimizationLevel: 7,
    //         },
    //         pngquant: {
    //           quality: '65-90',
    //           speed: 4,
    //         },
    //       },
    //     },
    //   ],
    // },
    {
      test: /\.html$/,
      loader: 'html-loader',
    }, {
      test: /\.json$/,
      loader: 'json-loader',
    }, {
      test: /\.(mp4|webm)$/,
      loader: 'url-loader',
      query: {
        limit: 10000,
      },
    }],
  },
  plugins: options.plugins.concat([
    new webpack.ProvidePlugin({
      // make fetch available
      fetch: 'exports-loader?self.fetch!whatwg-fetch',
      jQuery: 'jquery',
    }),

    // Always expose NODE_ENV to webpack, in order to use `process.env.NODE_ENV`
    // inside your code for any environment checks; UglifyJS will automatically
    // drop any unreachable code.
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV),
        CROWDIN_PLUGIN_ENABLED: !!process.env.CROWDIN_PLUGIN_ENABLED,
        SEGMENT_API_KEY: JSON.stringify(process.env.SEGMENT_API_KEY),
      },
    }),
    new webpack.NamedModulesPlugin(),
  ]),
  resolve: {
    modules: ['app', 'node_modules'],
    extensions: [
      '.js',
      '.jsx',
      '.react.js',
      '.ts',
      '.tsx',
    ],
    // Applied this hack https://github.com/react-boilerplate/react-boilerplate/issues/1657
    // It allows us to build using libraries that don't transpile to ES5, as they should.
    mainFields: [
      'browser',
      'main',
      'jsnext:main',
    ],
  },
  devtool: options.devtool,
  target: 'web', // Make web variables accessible to webpack, e.g. window
  performance: options.performance || {},
});
