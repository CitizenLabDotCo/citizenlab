const path = require('path');
const isDev = process.env.NODE_ENV === 'development';
const isProd = process.env.NODE_ENV === 'production';
const webpack = require('webpack');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const SentryCliPlugin = require('@sentry/webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const argv = require('yargs').argv;
const API_HOST = process.env.API_HOST || 'localhost';
const API_PORT = process.env.API_PORT || 4000;

// Used in the HtmlWebpackPlugin chunksSortMode
function IndexInRegexArray(stringToMatch, regexArray, notFoundIndex) {
  for (let i = 0; i < regexArray.length; i++) {
      if (stringToMatch.match(regexArray[i])) return i;
  }
  return notFoundIndex !== undefined ? notFoundIndex : -1;
};

const config = {
  entry: path.join(process.cwd(), 'app/root'),

  output: {
    path: path.resolve(process.cwd(), 'build'),
    pathinfo: false,
    publicPath: '/',
    filename: isProd ? '[name].[chunkhash].bundle.js' : '[name].[hash].bundle.js',
    sourceMapFilename: isProd ? '[name].[chunkhash].map' : '[name].[hash].map',
    chunkFilename: isProd ? '[name].[chunkhash].chunk.js' : '[name].[hash].chunk.js'
  },

  // optimized 4
  optimization: {
    splitChunks: {
      chunks: 'all',
      minSize: 30000,
      maxSize: 250000,
      minChunks: 1,
      maxAsyncRequests: 5,
      maxInitialRequests: 3,
      automaticNameDelimiter: '~',
      name: true,
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: -10
        },
        default: {
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true
        }
      }
    }
  },

  // optimized 3
  // optimization: {
  //   runtimeChunk: true,
  //   moduleIds: 'hashed',
  //   splitChunks: {
  //     hidePathInfo: true, // prevents the path from being used in the filename when using maxSize
  //     chunks: 'initial', // default is async, set to initial and then use async inside cacheGroups instead
  //     maxInitialRequests: Infinity, // Default is 3, make this unlimited if using HTTP/2
  //     maxAsyncRequests: Infinity, // Default is 5, make this unlimited if using HTTP/2
  //     // sizes are compared against source before minification
  //     minSize: 10000, // chunk is only created if it would be bigger than minSize
  //     maxSize: 40000, // splits chunks if bigger than 40k, added in webpack v4.15
  //     cacheGroups: { // create separate js files for bluebird, jQuery, bootstrap, aurelia and one for the remaining node modules
  //       default: false, // disable the built-in groups, default & vendors (vendors is overwritten below)

  //       // generic 'initial/sync' vendor node module splits: separates out larger modules
  //       vendorSplit: { // each node module as separate chunk file if module is bigger than minSize
  //         test: /[\\/]node_modules[\\/]/,
  //         name(module) {
  //           // Extract the name of the package from the path segment after node_modules
  //           const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];
  //           return `vendor.${packageName.replace('@', '')}`;
  //         },
  //         priority: 20
  //       },
  //       vendors: { // picks up everything else being used from node_modules that is less than minSize
  //         test: /[\\/]node_modules[\\/]/,
  //         name: 'vendors',
  //         priority: 19,
  //         enforce: true // create chunk regardless of the size of the chunk
  //       },

  //       // generic 'async' vendor node module splits: separates out larger modules
  //       vendorAsyncSplit: { // vendor async chunks, create each asynchronously used node module as separate chunk file if module is bigger than minSize
  //         test: /[\\/]node_modules[\\/]/,
  //         name(module) {
  //           const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];
  //           return `vendor.async.${packageName.replace('@', '')}`;
  //         },
  //         chunks: 'async',
  //         priority: 10,
  //         reuseExistingChunk: true,
  //         minSize: 5000 // only create if 5k or larger
  //       },
  //       vendorsAsync: { // vendors async chunk, remaining asynchronously used node modules as single chunk file
  //         test: /[\\/]node_modules[\\/]/,
  //         name: 'vendors.async',
  //         chunks: 'async',
  //         priority: 9,
  //         reuseExistingChunk: true,
  //         enforce: true // create chunk regardless of the size of the chunk
  //       },

  //       // generic 'async' common module splits: separates out larger modules
  //       commonAsync: { // common async chunks, each asynchronously used module as a separate chunk files
  //         name(module) {
  //           // Extract the name of the module from last path component. 'src/modulename/' results in 'modulename'
  //           const moduleName = module.context.match(/[^\\/]+(?=\/$|$)/)[0];
  //           return `common.async.${moduleName.replace('@', '')}`;
  //         },
  //         minChunks: 2, // Minimum number of chunks that must share a module before splitting
  //         chunks: 'async',
  //         priority: 1,
  //         reuseExistingChunk: true,
  //         minSize: 5000 // only create if 5k or larger
  //       },
  //       commonsAsync: { // commons async chunk, remaining asynchronously used modules as single chunk file
  //         name: 'commons.async',
  //         minChunks: 2, // Minimum number of chunks that must share a module before splitting
  //         chunks: 'async',
  //         priority: 0,
  //         reuseExistingChunk: true,
  //         enforce: true // create chunk regardless of the size of the chunk
  //       }
  //     }
  //   }
  // },

  // optimized 2
  // optimization: {
  //   runtimeChunk: 'single',
  //   splitChunks: {
  //     chunks: 'all',
  //     cacheGroups: {
  //       default: {
  //         enforce: true,
  //         priority: 1
  //       },
  //       vendors: {
  //         test: /[\\/]node_modules[\\/]/,
  //         priority: 2,
  //         name: 'vendors',
  //         enforce: true,
  //         chunks: 'all'
  //       }
  //     }
  //   }
  // },

  // optimized 1
  // optimization: {
  //   runtimeChunk: 'single',
  //   splitChunks: {
  //     chunks: 'all',
  //     maxInitialRequests: Infinity,
  //     minSize: 0,
  //     cacheGroups: {
  //       vendor: {
  //         test: /[\\/]node_modules[\\/]/,
  //         name(module) {
  //           // get the name. E.g. node_modules/packageName/not/this/part.js
  //           // or node_modules/packageName
  //           const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];

  //           // npm package names are URL-safe, but some servers don't like @ symbols
  //           return `npm.${packageName.replace('@', '')}`;
  //         },
  //       },
  //     },
  //   },
  // },

  // current master
  // optimization: {
  //   splitChunks: {
  //     chunks: 'all',
  //   },
  // },

  // webpack default
  // optimization: {
  //   splitChunks: {
  //     chunks: 'async',
  //     minSize: 30000,
  //     maxSize: 0,
  //     minChunks: 1,
  //     maxAsyncRequests: 5,
  //     maxInitialRequests: 3,
  //     automaticNameDelimiter: '~',
  //     name: true,
  //     cacheGroups: {
  //       vendors: {
  //         test: /[\\/]node_modules[\\/]/,
  //         priority: -10
  //       },
  //       default: {
  //         minChunks: 2,
  //         priority: -20,
  //         reuseExistingChunk: true
  //       }
  //     }
  //   }
  // },

  mode: isDev ? 'development' : 'production',

  devtool: isDev ? 'cheap-module-eval-source-map' : (isProd ? 'source-map' : false),

  devServer: {
    contentBase: path.join(process.cwd(), 'build'),
    port: 3000,
    host: '0.0.0.0',
    disableHostCheck: true,
    historyApiFallback: true,
    proxy: {
      '/web_api': `http://${API_HOST}:${API_PORT}`,
      '/auth/': `http://${API_HOST}:${API_PORT}`,
      '/widgets/': `http://${API_HOST}:3200`,
    },
  },

  module: {
    rules: [
      {
        test: /\.(tsx?)|(js)$/,
        include: path.join(process.cwd(), 'app'),
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true
          }
        }
      },
      {
        test: /\.css$/,
        use: [
          { loader: isDev ? 'style-loader' : MiniCssExtractPlugin.loader },
          { loader: 'css-loader' },
        ],
      },
      {
        test: /\.(svg|jpg|png|gif)$/,
        use: [
          { loader: 'cache-loader' },
          {
            loader: 'url-loader',
            options: {
              limit: 8192,
            },
          },
        ],
      },
      {
        test: /\.(eot|ttf|woff|woff2)$/,
        loader: 'file-loader',
        options: {
          name: '[name].[hash].[ext]'
        }
      },
      {
        test: /\.htaccess/,
        include: path.resolve(process.cwd(), 'app'),
        use: {
          loader: 'file-loader',
          options: {
            name: '[name].[ext]',
          },
        },
      },
    ],
  },

  plugins: [
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV),
        API_HOST: JSON.stringify(process.env.API_HOST),
        API_PORT: JSON.stringify(process.env.API_PORT),
        CROWDIN_PLUGIN_ENABLED: !!process.env.CROWDIN_PLUGIN_ENABLED,
        SEGMENT_API_KEY: JSON.stringify(process.env.SEGMENT_API_KEY),
        SENTRY_DSN: JSON.stringify(process.env.SENTRY_DSN),
        CI: JSON.stringify(process.env.CI),
        CIRCLECI: JSON.stringify(process.env.CIRCLECI),
        CIRCLE_BUILD_NUM: JSON.stringify(process.env.CIRCLE_BUILD_NUM),
        CIRCLE_SHA1: JSON.stringify(process.env.CIRCLE_SHA1),
        CIRCLE_BRANCH: JSON.stringify(process.env.CIRCLE_BRANCH),
      },
    }),

    new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),

    new ForkTsCheckerWebpackPlugin({
      checkSyntacticErrors: true,
      tsconfig: path.join(process.cwd(), 'app/tsconfig.json'),
      silent: !!argv.json, // silent when trying to profile the chunks sizes
    }),

    new CleanWebpackPlugin(),

    new HtmlWebpackPlugin({
      template: 'app/index.html',
      // sorts the chunks according to the chunkOrderMatches array, then by descending size
      chunksSortMode: (chunkA, chunkB) => {
        let chunkOrderMatches = [ /^vendor/ ];
        let orderA = IndexInRegexArray(chunkA.names[0], chunkOrderMatches, 9999);
        let orderB = IndexInRegexArray(chunkB.names[0], chunkOrderMatches, 9999);
        if (chunkA.entry) orderA = -1;
        if (chunkB.entry) orderB = -1;
        return (orderA + (1 / (chunkA.size + 2))) - (orderB + (1 / (chunkB.size + 2)));
      }
    }),

    new MiniCssExtractPlugin({
      filename: '[name].[hash].css',
      chunkFilename: '[name].[hash].chunk.css'
    }),

    // new BundleAnalyzerPlugin()
  ],

  resolve: {
    modules: [path.resolve(process.cwd(), 'app'), 'node_modules'],
    extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
  },
};

if (isDev) {
  config.plugins.push(new webpack.ProgressPlugin());
} else if (isProd) {
  config.plugins.push(new SentryCliPlugin({
    include: path.resolve(process.cwd(), 'build'),
    release: process.env.CIRCLE_BUILD_NUM,
  }));
}

module.exports = config;
