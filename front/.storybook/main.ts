import type { StorybookConfig } from '@storybook/react-vite';

import mockModules from './mockModules.ts';

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
    'storybook-react-intl'
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
        // Only expose the env vars actually read by app/ code (Storybook bundles
        // only app/). Avoid passing the whole process.env, which Vite 8 flags as a
        // security risk for leaking host environment variables into the bundle.
        'process.env': {
          NODE_ENV: process.env.NODE_ENV,
          API_HOST: process.env.API_HOST,
          API_PORT: process.env.API_PORT,
          GRAPHQL_HOST: process.env.GRAPHQL_HOST,
          GRAPHQL_PORT: process.env.GRAPHQL_PORT,
          INTERCOM_APP_ID: process.env.INTERCOM_APP_ID,
          SENTRY_DSN: process.env.SENTRY_DSN,
          SENTRY_ENV: process.env.SENTRY_ENV,
          MATOMO_HOST: process.env.MATOMO_HOST,
          POSTHOG_API_KEY: process.env.POSTHOG_API_KEY,
        }
      }
    });
  },
  staticDirs: ['./public', './static'],
};
export default config;
