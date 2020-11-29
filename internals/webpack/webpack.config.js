const path = require('path');
const isDev = process.env.NODE_ENV === 'development';
const isProd = process.env.NODE_ENV === 'production';
const isTestBuild = process.env.TEST_BUILD === 'true';
const buildSourceMap = !isDev && !isTestBuild;
const webpack = require('webpack');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const MomentLocalesPlugin = require('moment-locales-webpack-plugin');
const MomentTimezoneDataPlugin = require('moment-timezone-data-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const SentryCliPlugin = require('@sentry/webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const argv = require('yargs').argv;
const appLocalesMomentPairs = require(path.join(process.cwd(), 'app/containers/App/constants')).appLocalesMomentPairs;
const API_HOST = process.env.API_HOST || 'localhost';
const API_PORT = process.env.API_PORT || 4000;
const GRAPHQL_HOST = process.env.GRAPHQL_HOST || 'localhost';
const GRAPHQL_PORT = process.env.GRAPHQL_PORT || 5001;
const DEV_WORKSHOPS_HOST = process.env.DEV_WORKSHOPS_HOST || 'localhost';
const DEV_WORKSHOPS_PORT = process.env.DEV_WORKSHOPS_PORT || 4005;

const currentYear = new Date().getFullYear();

const config = {
  entry: path.join(process.cwd(), 'app/root'),

  output: {
    path: path.join(process.cwd(), 'build'),
    pathinfo: false,
    publicPath: '/',
    filename: isDev ? '[name].js' : '[name].[contenthash].js',
    chunkFilename: isDev ? '[name].chunk.js' : '[name].[contenthash].chunk.js'
  },

  mode: isDev ? 'development' : 'production',

  devtool: isDev ? 'cheap-module-eval-source-map' : (!isTestBuild ? 'source-map' : false),

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
      '/admin_templates_api': `http://${GRAPHQL_HOST}:${GRAPHQL_PORT}`,
      '/uploads': `http://${API_HOST}:${API_PORT}`,
      '/workshops': `http://${DEV_WORKSHOPS_HOST}:${DEV_WORKSHOPS_PORT}`,
    },
  },

  ...!isDev && {
    optimization: {
      runtimeChunk: 'single',
      splitChunks: {
        chunks: 'all',
      },
      minimize: true,
      minimizer: [
        new TerserPlugin({
          parallel: false,
          sourceMap: true
        }),
        new OptimizeCSSAssetsPlugin()
      ]
    }
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
        loader: 'url-loader',
        options: {
          limit: 8192,
        }
      },
      {
        test: /\.(eot|ttf|woff|woff2)$/,
        loader: 'file-loader',
        options: {
          name: '[name].[ext]',
        }
      },
      {
        test: /\.htaccess/,
        include: path.join(process.cwd(), 'app'),
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
        GRAPHQL_HOST: JSON.stringify(process.env.GRAPHQL_HOST),
        GRAPHQL_PORT: JSON.stringify(process.env.GRAPHQL_PORT),
        CROWDIN_PLUGIN_ENABLED: !!process.env.CROWDIN_PLUGIN_ENABLED,
        SEGMENT_API_KEY: JSON.stringify(process.env.SEGMENT_API_KEY),
        INTERCOM_APP_ID: JSON.stringify(process.env.INTERCOM_APP_ID),
        SENTRY_DSN: JSON.stringify(process.env.SENTRY_DSN),
        CI: JSON.stringify(process.env.CI),
        CIRCLECI: JSON.stringify(process.env.CIRCLECI),
        CIRCLE_BUILD_NUM: JSON.stringify(process.env.CIRCLE_BUILD_NUM),
        CIRCLE_SHA1: JSON.stringify(process.env.CIRCLE_SHA1),
        CIRCLE_BRANCH: JSON.stringify(process.env.CIRCLE_BRANCH),
      },
    }),

    new ForkTsCheckerWebpackPlugin({
      checkSyntacticErrors: true,
      tsconfig: path.join(process.cwd(), 'app/tsconfig.json'),
      silent: !!argv.json, // silent when trying to profile the chunks sizes
    }),

    new CleanWebpackPlugin(),

    new HtmlWebpackPlugin({
      template: 'app/index.html'
    }),

    // new BundleAnalyzerPlugin(),

    isDev && new webpack.ProgressPlugin(),

    // remove all moment locales except 'en' and the ones defined in appLocalesMomentPairs
    !isDev && new MomentLocalesPlugin({
      localesToKeep: [...new Set(Object.values(appLocalesMomentPairs))]
    }),

    !isDev && new MomentTimezoneDataPlugin({
      startYear: 2014,
      endYear: currentYear + 8,
    }),

    !isDev && new MiniCssExtractPlugin({
      filename: '[name].[contenthash].css',
      chunkFilename: '[name].[contenthash].chunk.css'
    }),

    !isDev && new webpack.HashedModuleIdsPlugin(),

    buildSourceMap && new SentryCliPlugin({
      include: path.join(process.cwd(), 'build'),
      release: process.env.CIRCLE_BUILD_NUM,
    })
  ].filter(Boolean),

  resolve: {
    modules: [path.join(process.cwd(), 'app'), 'node_modules'],
    extensions: ['.wasm', '.mjs', '.js', '.jsx', '.ts', '.tsx', '.json'],
    alias: {
      'polished': path.resolve('./node_modules/polished'),
      'moment': path.resolve('./node_modules/moment'),
      'react': path.resolve('./node_modules/react'),
      'styled-components': path.resolve('./node_modules/styled-components'),
    }
  },
};

module.exports = config;
