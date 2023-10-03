const path = require('path');

const isDev = process.env.NODE_ENV === 'development';
const isProd = process.env.NODE_ENV === 'production';
const isTestBuild = process.env.TEST_BUILD === 'true';
const sourceMapToSentry = !isDev && !isTestBuild && process.env.CI;

const webpack = require('webpack');

const { EsbuildPlugin } = require('esbuild-loader');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MomentLocalesPlugin = require('moment-locales-webpack-plugin');
const MomentTimezoneDataPlugin = require('moment-timezone-data-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const SentryCliPlugin = require('@sentry/webpack-plugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

const dotenv = require('dotenv');
dotenv.config({
  path: path.join(process.cwd(), '../env_files/front-safe.env'),
});
dotenv.config({
  path: path.join(process.cwd(), '../env_files/front-secret.env'),
});

const argv = require('yargs').argv;
const appLocalesMomentPairs = require(path.join(
  process.cwd(),
  'app/containers/App/constants'
)).appLocalesMomentPairs;
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
    filename: isDev ? '[name].js' : '[name].[contenthash].min.js',
    chunkFilename: isDev
      ? '[name].chunk.js'
      : '[name].[contenthash].chunk.min.js',
  },

  mode: isDev ? 'development' : 'production',

  devtool: isDev
    ? 'eval-cheap-module-source-map'
    : !isTestBuild
    ? 'hidden-source-map'
    : false,

  devServer: {
    port: 3000,
    host: '0.0.0.0',
    allowedHosts: 'all',
    historyApiFallback: true,
    proxy: {
      '/web_api': `http://${API_HOST}:${API_PORT}`,
      '/auth/': `http://${API_HOST}:${API_PORT}`,
      '/widgets/': `http://${API_HOST}:3200`,
      '/admin_templates_api': `http://${GRAPHQL_HOST}:${GRAPHQL_PORT}`,
      '/uploads': `http://${API_HOST}:${API_PORT}`,
      '/workshops': `http://${DEV_WORKSHOPS_HOST}:${DEV_WORKSHOPS_PORT}`,
    },
    client: {
      overlay: false,
    },
    hot: true,
  },

  ...(!isDev && {
    optimization: {
      runtimeChunk: 'single',
      minimize: true,
      minimizer: [new EsbuildPlugin()],
    },
  }),

  module: {
    rules: [
      {
        test: /\.[tj]sx?$/,
        include: path.join(process.cwd(), 'app'),
        loader: 'esbuild-loader',
        options: {
          target: 'es2015',
        },
      },
      {
        test: /\.css$/i,
        use: [
          'style-loader',
          'css-loader',
          {
            loader: 'esbuild-loader',
            options: {
              minify: true,
            },
          },
        ],
      },
      {
        test: /\.(svg|jpg|png|gif)$/,
        type: 'asset/resource',
      },
      {
        test: /\.(eot|ttf|woff|woff2)$/,
        type: 'asset',
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
        SENTRY_ENV: JSON.stringify(process.env.SENTRY_ENV),
        SENTRY_AUTH_TOKEN: JSON.stringify(process.env.SENTRY_AUTH_TOKEN),
        CI: JSON.stringify(process.env.CI),
        CIRCLECI: JSON.stringify(process.env.CIRCLECI),
        CIRCLE_BUILD_NUM: JSON.stringify(process.env.CIRCLE_BUILD_NUM),
        CIRCLE_SHA1: JSON.stringify(process.env.CIRCLE_SHA1),
        CIRCLE_BRANCH: JSON.stringify(process.env.CIRCLE_BRANCH),
        GOOGLE_MAPS_API_KEY: JSON.stringify(process.env.GOOGLE_MAPS_API_KEY),
        MATOMO_HOST: JSON.stringify(process.env.MATOMO_HOST),
        POSTHOG_API_KEY: JSON.stringify(process.env.POSTHOG_API_KEY),
      },
    }),

    isDev && new ReactRefreshWebpackPlugin({ overlay: false }),

    new ForkTsCheckerWebpackPlugin({
      async: isDev,
      typescript: {
        configFile: path.join(process.cwd(), 'app/tsconfig.json'),
      },
      logger: { infrastructure: !!argv.json ? 'silent' : 'console' }, // silent when trying to profile the chunks sizes
    }),

    new CleanWebpackPlugin(),

    new HtmlWebpackPlugin({
      template: 'app/index.html',
      templateParameters: {
        GOOGLE_MAPS_API_KEY: process.env.GOOGLE_MAPS_API_KEY,
      },
    }),

    new webpack.ProvidePlugin({
      process: 'process/browser',
    }),

    // new BundleAnalyzerPlugin(),

    // remove all moment locales except 'en' and the ones defined in appLocalesMomentPairs
    !isDev &&
      new MomentLocalesPlugin({
        localesToKeep: [...new Set(Object.values(appLocalesMomentPairs))],
      }),

    !isDev &&
      new MomentTimezoneDataPlugin({
        startYear: 2014,
        endYear: currentYear + 8,
      }),

    sourceMapToSentry &&
      new SentryCliPlugin({
        include: path.join(process.cwd(), 'build'),
        release: process.env.CIRCLE_BUILD_NUM,
      }),
  ].filter(Boolean),

  resolve: {
    modules: [path.join(process.cwd(), 'app'), 'node_modules'],
    extensions: ['.wasm', '.mjs', '.js', '.jsx', '.ts', '.tsx', '.json'],
    alias: {
      polished: path.resolve('./node_modules/polished'),
      moment: path.resolve('./node_modules/moment'),
      react: path.resolve('./node_modules/react'),
      'styled-components': path.resolve('./node_modules/styled-components'),
      'react-transition-group': path.resolve(
        './node_modules/react-transition-group'
      ),
    },
    fallback: {
      util: require.resolve('util/'),
      https: require.resolve('https-browserify'),
      http: require.resolve('stream-http'),
      buffer: require.resolve('buffer'),
      // https://github.com/react-dnd/react-dnd/issues/3425
      'process/browser': require.resolve('process/browser'),
    },
  },
};

module.exports = config;
