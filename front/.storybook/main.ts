const path = require('path');
import type { StorybookConfig } from '@storybook/react-webpack5';
const webpack = require('webpack');
import mockModules from './mockModules';
const { EsbuildPlugin } = require('esbuild-loader');

const config: StorybookConfig = {
  stories: ['../app/**/*.mdx', '../app/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',

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
  docs: {
    autodocs: 'tag',
  },
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

    return config;
  },
  staticDirs: ['./public', './static'],
};
export default config;
