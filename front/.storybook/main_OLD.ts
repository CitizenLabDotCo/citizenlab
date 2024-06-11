const path = require('path');
import { StorybookConfig } from '@storybook/react-webpack5';
const webpack = require('webpack');
import mockModules from './mockModules';
const { EsbuildPlugin } = require('esbuild-loader');

const config: StorybookConfig = {
  stories: ['../app/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    // This plugin was causing a peer dependency conflict.
    // We first need to upgrade our main app to react-router-dom >=6.4.0
    // This upgrade has breaking changes so those need to be dealt with first.
    // 'storybook-addon-react-router-v6',
    'storybook-react-intl',
  ],
  framework: {
    name: '@storybook/react-webpack5',
    options: {},
  },
  docs: {},
  babel: async () => {
    const opt = require('./.babelrc.json');
    return opt;
  },
  webpackFinal(config, _options) {
    config.resolve = {
      ...config.resolve,
      modules: [
        path.join(process.cwd(), 'app'),
        ...(config?.resolve?.modules ?? []),
      ],
      alias: {
        ...mockModules,
        polished: path.resolve('./node_modules/polished'),
        moment: path.resolve('./node_modules/moment'),
        react: path.resolve('./node_modules/react'),
        'styled-components': path.resolve('./node_modules/styled-components'),
        'react-transition-group': path.resolve(
          './node_modules/react-transition-group'
        ),
        '@citizenlab/cl2-component-library': path.resolve(
          'app/component-library'
        ),
        ...(config?.resolve?.alias ?? {}),
      },
    };

    config.plugins = [
      ...(config?.plugins?.constructor === Array ? config.plugins : []),
      new webpack.ProvidePlugin({
        process: 'process/browser',
      }),
    ];

    config.optimization = {
      runtimeChunk: 'single',
      minimize: true,
      minimizer: [new EsbuildPlugin()],
    };

    if (!config.module) {
      config.module = {};
    }

    config.module.rules = [
      {
        test: /\.[tj]sx?$/,
        include: [
          path.join(process.cwd(), 'app'),
          path.join(process.cwd(), '.storybook'),
        ],
        loader: 'esbuild-loader',
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
    ]

    return config;
  },
  staticDirs: ['./public', './static'],
};
export default config;
