const path = require('path');
import type { StorybookConfig } from '@storybook/react-webpack5';
const webpack = require('webpack');
import mockModules from './mockModules';

const config: StorybookConfig = {
  stories: [
    '../app/**/*.mdx',
    '../app/**/*.stories.@(js|jsx|mjs|ts|tsx)',
  ],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-onboarding',
    '@storybook/addon-interactions',
    'storybook-addon-react-router-v6'
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
        ...(config?.resolve?.modules ?? [])
      ],
      alias: {
        ...mockModules,
        ...(config?.resolve?.alias ?? {})
      }
    }


    config.plugins = [
      ...(config?.plugins?.constructor === Array ? config.plugins : []),
      new webpack.ProvidePlugin({
        process: 'process/browser',
      }),
    ]
    
    return config;
  },
  staticDirs: ['./public', './static']
};
export default config;
