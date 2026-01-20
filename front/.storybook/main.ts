import type { StorybookConfig } from '@storybook/react-vite';

import mockModules from './mockModules';

const APP_FOLDER_ALIASES = [
  'api',
  'assets',
  'component-library',
  'components',
  'containers',
  'context',
  'global-styles',
  'hooks',
  'i18n',
  'modules',
  'resources',
  'root',
  'routes',
  'translations',
  'typings',
  'utils'
].map((folder) => ({
  find: folder,
  replacement: `${process.cwd()}/app/${folder}`
}));

const COMPONENT_LIBRARY_ALIAS = {
  find: '@citizenlab/cl2-component-library',
  replacement: `${process.cwd()}/app/component-library`
};

const CONSTANTS_ALIAS = {
  find: 'app/containers/App/constants',
  replacement: `${process.cwd()}/app/containers/App/constants.ts`
}

const config: StorybookConfig = {
  stories: ['../app/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    // This plugin was causing a peer dependency conflict.
    // We first need to upgrade our main app to react-router-dom >=6.4.0
    // This upgrade has breaking changes so those need to be dealt with first.
    // 'storybook-addon-react-router-v6',
    'storybook-react-intl',
    '@storybook/addon-viewport'
  ],
  framework: '@storybook/react-vite',
  core: {
    builder: '@storybook/builder-vite',
  },
  docs: {},
  babel: async () => {
    const opt = await import('./.babelrc.json');
    return opt;
  },
  async viteFinal(config) {
    // Merge custom configuration into the default config
    const { mergeConfig } = await import('vite');

    const mockModuleAliases = Object.entries(mockModules).map(
      ([find, replacement]) => ({ find, replacement })
    );

    return mergeConfig(config, {
      resolve: {
        alias: [
          ...mockModuleAliases,
          ...APP_FOLDER_ALIASES,
          COMPONENT_LIBRARY_ALIAS,
          CONSTANTS_ALIAS
        ]
      },
      define: {
        'process.env': process.env
      }
    });
  },
  staticDirs: ['./public', './static'],
};
export default config;
