const path = require('path');
const isDev = process.env.NODE_ENV === 'development';
const webpack = require('webpack');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');
const ExtractTextPlugin = require("extract-text-webpack-plugin");
const ResourceHintWebpackPlugin = require('resource-hints-webpack-plugin');
const argv = require('yargs').argv;

// Avoid repeating the babel loader config
const BabelLoaderConfig = {
  loader: 'babel-loader',
  options: {
    cacheDirectory: path.join(process.cwd(), '.babel-cache'),
  },
};

const WEBPACK_CONFIG = {
  entry: [
    // 'core-js',
    // 'babel-polyfill',
    path.join(process.cwd(), 'app/app.js'),
  ],

  output: {
    path: path.resolve(process.cwd(), 'build'),
    publicPath: '/',
    filename: isDev ? '[name].js' : '[name].[chunkhash].js',
    chunkFilename: isDev ? '[name].chunk.js' : '[name].[chunkhash].chunk.js',
  },
  // Loaders
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        use: BabelLoaderConfig,
        exclude: /node_modules/,
      },
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: [BabelLoaderConfig, 'cache-loader', { loader: 'ts-loader', options: { transpileOnly: true } }],
      },
      {
        test: /\.css$/,
        include: /node_modules/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: 'css-loader',
        }),
      },
      {
        test: /\.(svg|jpg|png|gif|eot|ttf|woff|woff2)$/,
        use: [
          'cache-loader',
          {
            loader: 'url-loader',
            options: {
              limit: 8192,
            },
          },
        ],
      },
      {
        test: /manifest\.json$|\.htaccess/,
        include: path.resolve(process.cwd(), 'app'),
        use: {
          loader: 'file-loader',
          options: {
            name: '[name].[ext]',
          },
        },
      },
      {
        test: /\.json$/,
        loader: ['cache-loader', 'json-loader'],
      },
    ],
  },

  plugins: [
    // Define variables to be accessible by the app codebase
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV),
        API_HOST: JSON.stringify(process.env.API_HOST),
        API_PORT: JSON.stringify(process.env.API_PORT),
        CROWDIN_PLUGIN_ENABLED: !!process.env.CROWDIN_PLUGIN_ENABLED,
        SEGMENT_API_KEY: JSON.stringify(process.env.SEGMENT_API_KEY),
        // Sentry DSN
        SENTRY_DSN: JSON.stringify(process.env.SENTRY_DSN),
        // Circle CI flags, used for Sentry reporting
        CI: JSON.stringify(process.env.CI),
        CIRCLECI: JSON.stringify(process.env.CIRCLECI),
        CIRCLE_BUILD_NUM: JSON.stringify(process.env.CIRCLE_BUILD_NUM),
        CIRCLE_SHA1: JSON.stringify(process.env.CIRCLE_SHA1),
        CIRCLE_BRANCH: JSON.stringify(process.env.CIRCLE_BRANCH),
      },
    }),

    // Starts type checking in a separate thread
    new ForkTsCheckerWebpackPlugin({
      tsconfig: path.join(process.cwd(), 'app/tsconfig.json'),
      silent: !!argv.json, // silent when trying to profile the chunks sizes
    }),

    // Inject built files into index.html
    new HtmlWebpackPlugin({
      template: 'app/index.html',
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeRedundantAttributes: true,
        useShortDoctype: true,
        removeEmptyAttributes: true,
        removeStyleLinkTypeAttributes: true,
        keepClosingSlash: true,
        minifyJS: true,
        minifyCSS: true,
        minifyURLs: true,
      },
      inject: true,
      // Preload anything that's necessary (download as fast as possible)
      preload: [
        'main.js',
        'main.*.js',
        '*.eot',
        '*.ttf',
        '*.woff',
        '*.woff2',
      ],
      // Prefetch any chunk to have them load faster when switching pages
      prefetch: [
        '*.chunk.js',
      ],
    }),

    new ResourceHintWebpackPlugin(),

    // Common chunks optimization
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      children: true,
      minChunks: 2,
      async: true,
    }),

    // CSS Splitting
    new ExtractTextPlugin('styles.[contenthash].css'),
  ],

  resolve: {
    modules: ['app', 'node_modules'],
    extensions: [
      '.js',
      '.jsx',
      '.react.js',
      '.ts',
      '.tsx',
    ],
  },
  target: 'web',
};

// API settings
const API_HOST = process.env.API_HOST || 'localhost';
const API_PORT = process.env.API_PORT || 4000;

// Environment-specific config
if (isDev) {
  // Quick source maps for rebuilds
  WEBPACK_CONFIG.devtool = 'eval-source-map';

  // Dev Server for the WIP files
  WEBPACK_CONFIG.devServer = {
    contentBase: path.join(process.cwd(), 'build'),
    compress: true,
    host: '0.0.0.0',
    port: 3000,
    disableHostCheck: true,
    hot: true,
    historyApiFallback: true,
    proxy: {
      '/web_api': `http://${API_HOST}:${API_PORT}`,
      '/auth': `http://${API_HOST}:${API_PORT}`,
    },
    stats: {
      chunks: false,
      chunkOrigins: false,
      modules: false,
      performance: true,
      timings: true,
    },
  };

  // Show progress
  WEBPACK_CONFIG.plugins.push(new webpack.ProgressPlugin());

  // HMR plugin
  WEBPACK_CONFIG.plugins.push(new webpack.HotModuleReplacementPlugin());
  WEBPACK_CONFIG.plugins.push(new webpack.NamedModulesPlugin());
} else {
  // Optimization of the output
  WEBPACK_CONFIG.plugins.push(
    new UglifyJSPlugin({
      cache: true,
      sourceMap: false,
      parallel: true,
      uglifyOptions: {

      },
    })
  );

  // Ensure consistent vendor build names
  WEBPACK_CONFIG.plugins.push(new webpack.HashedModuleIdsPlugin());

  // Stats output
  if (!argv.json) {
    WEBPACK_CONFIG.stats = {
      chunks: false,
      chunkOrigins: false,
      modules: false,
      performance: true,
      timings: true,
    };
  }
}

module.exports = WEBPACK_CONFIG;
