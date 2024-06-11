import { StorybookConfig } from '@storybook/react-webpack5';

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
  staticDirs: ['./public', './static'],
};
export default config;
