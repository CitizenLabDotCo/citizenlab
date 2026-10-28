import fs from 'fs';

import type { StorybookConfig } from '@storybook/react-vite';
import type { Plugin } from 'vite';

import mockModules from './mockModules.ts';

const APP_FOLDER_ALIASES = [
  'api',
  'assets',
  'component-library',
  'components',
  'containers',
  'context',
  // The app resolves it through tsconfig baseUrl; stories that read the
  // tokens by `design-system/...` need the alias.
  'design-system',
  'global-styles',
  'hooks',
  'i18n',
  'modules',
  'resources',
  'root',
  'routes',
  'translations',
  'typings',
  'utils',
].map((folder) => ({
  find: folder,
  replacement: `${process.cwd()}/app/${folder}`,
}));

const COMPONENT_LIBRARY_ALIAS = {
  find: '@citizenlab/cl2-component-library',
  replacement: `${process.cwd()}/app/component-library`,
};

const CONSTANTS_ALIAS = {
  find: 'app/containers/App/constants',
  replacement: `${process.cwd()}/app/containers/App/constants.ts`,
};

// Opt-in bundle analysis: `SB_BUNDLE_STATS=<file> npm run build-storybook`
// writes each chunk's size, imports and modules (rendered bytes) to <file>,
// to see what the preview frame loads before a story renders.
const bundleStats = (file: string): Plugin => ({
  name: 'gv-bundle-stats',
  generateBundle(_options, bundle) {
    const chunks = Object.values(bundle).flatMap((chunk) =>
      chunk.type === 'chunk'
        ? [
            [
              chunk.fileName,
              {
                isEntry: chunk.isEntry,
                size: chunk.code.length,
                imports: chunk.imports,
                dynamicImports: chunk.dynamicImports,
                modules: Object.fromEntries(
                  Object.entries(chunk.modules).map(([id, m]) => [
                    id,
                    m.renderedLength,
                  ])
                ),
              },
            ],
          ]
        : []
    );
    fs.writeFileSync(file, JSON.stringify(Object.fromEntries(chunks)));
  },
});

const config: StorybookConfig = {
  stories: ['../app/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    // This plugin was causing a peer dependency conflict.
    // We first need to upgrade our main app to react-router-dom >=6.4.0
    // This upgrade has breaking changes so those need to be dealt with first.
    // 'storybook-addon-react-router-v6',
    '@storybook/addon-a11y',
    // Hover, focus and active states through `parameters.pseudo`.
    'storybook-addon-pseudo-states',
    // MCP server at /mcp on the dev server, for agents (preview software).
    '@storybook/addon-mcp',
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

    const statsFile = process.env.SB_BUNDLE_STATS;

    return mergeConfig(config, {
      // `npm run ds:local`: served under /storybook/ next to the platform.
      ...(process.env.DS_LOCAL_BASE ? { base: process.env.DS_LOCAL_BASE } : {}),
      plugins: [
        ...(statsFile ? [bundleStats(statsFile)] : []),
        ...(process.env.DS_LOCAL_BASE
          ? [underBase(process.env.DS_LOCAL_BASE)]
          : []),
      ],
      resolve: {
        alias: [
          ...mockModuleAliases,
          ...APP_FOLDER_ALIASES,
          COMPONENT_LIBRARY_ALIAS,
          CONSTANTS_ALIAS,
        ],
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
        },
      },
    });
  },
  staticDirs: ['./public', './static'],
};
export default config;

// Under a base, Storybook's iframe still asks for two entry scripts at the
// root; point them under the base too.
function underBase(base: string): Plugin {
  return {
    name: 'ds-local-under-base',
    transformIndexHtml: {
      order: 'post',
      handler: (html) =>
        html.replace(/(src|href)="\/(?!\/)(?!storybook\/)/g, `$1="${base}`),
    },
  };
}
