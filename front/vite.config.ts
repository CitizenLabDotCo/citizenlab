import path from 'path';

import { sentryVitePlugin } from '@sentry/vite-plugin';
import react from '@vitejs/plugin-react';
import moment from 'moment';
import { defineConfig, loadEnv } from 'vite';
import checker from 'vite-plugin-checker';
import commonjs from 'vite-plugin-commonjs';
import EnvironmentPlugin from 'vite-plugin-env-compatible';
import { createHtmlPlugin } from 'vite-plugin-html';
import tsconfigPaths from 'vite-plugin-tsconfig-paths';

// Define Vite configuration
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, path.resolve('../env_files'), ['SAFE', 'SECRET']);

  const API_HOST = env.API_HOST || 'localhost';
  const API_PORT = env.API_PORT || '4000';
  const GRAPHQL_HOST = env.GRAPHQL_HOST || 'localhost';
  const GRAPHQL_PORT = env.GRAPHQL_PORT || '5001';
  const DEV_WORKSHOPS_HOST = env.DEV_WORKSHOPS_HOST || 'localhost';
  const DEV_WORKSHOPS_PORT = env.DEV_WORKSHOPS_PORT || '4005';

  const isDev = mode === 'development';
  const isProd = mode === 'production';
  const isTestBuild = env.TEST_BUILD === 'true';

  return {
    root: path.resolve(__dirname, 'app'), // Root directory
    base: '/', // Base path for public assets
    server: {
      port: 3000,
      host: '0.0.0.0',
      proxy: {
        '/web_api': {
          target: `http://${API_HOST}:${API_PORT}`,
          changeOrigin: true,
        },
        '/auth/': {
          target: `http://${API_HOST}:${API_PORT}`,
          changeOrigin: true,
        },
        '/widgets/': {
          target: `http://${API_HOST}:3200`,
          changeOrigin: true,
        },
        '/admin_templates_api': {
          target: `http://${GRAPHQL_HOST}:${GRAPHQL_PORT}`,
          changeOrigin: true,
        },
        '/uploads': {
          target: `http://${API_HOST}:${API_PORT}`,
          changeOrigin: true,
        },
        '/workshops': {
          target: `http://${DEV_WORKSHOPS_HOST}:${DEV_WORKSHOPS_PORT}`,
          changeOrigin: true,
        },
      },
    },
    plugins: [
      react(),
      checker({
        overlay: { initialIsOpen: false },
        typescript: true,
        eslint: {
          lintCommand: `eslint "${process.cwd()}/app/**/*.{js,jsx,ts,tsx}" --ignore-pattern app/__generated__/`,
        },
      }),
      commonjs(),
      tsconfigPaths(), // Support for TS path aliases
      EnvironmentPlugin({
        prefix: 'VITE_', // Load all env vars prefixed with "VITE_"
      }),
      createHtmlPlugin({
        inject: {
          data: {
            GOOGLE_MAPS_API_KEY: env.GOOGLE_MAPS_API_KEY,
          },
        },
      }),
      sentryVitePlugin({
        url: 'https://sentry.hq.citizenlab.co/',
        authToken: env.SENTRY_AUTH_TOKEN,
        org: 'citizenlab',
        project: 'cl2-front',
        release: {
          name: env.CIRCLE_BUILD_NUM,
          deploy: {
            env: mode,
          },
        },
      }),
    ],
    build: {
      outDir: '../build',
      sourcemap: !isDev && !isTestBuild,
      minify: isProd,
      rollupOptions: {
        output: {
          entryFileNames: isDev ? '[name].js' : '[name].[hash].js',
          chunkFileNames: isDev ? '[name].chunk.js' : '[name].[hash].chunk.js',
        },
      },
    },
    resolve: {
      alias: {
        assets: path.resolve(__dirname, 'app/assets'),
        components: path.resolve(__dirname, 'app/components'),
        containers: path.resolve(__dirname, 'app/containers'),
        hooks: path.resolve(__dirname, 'app/hooks'),
        modules: path.resolve(__dirname, 'app/modules'),
        utils: path.resolve(__dirname, 'app/utils'),
        api: path.resolve(__dirname, 'app/api'),
        translations: path.resolve(__dirname, 'app/translations'),
        routes: path.resolve(__dirname, 'app/routes'),
        resources: path.resolve(__dirname, 'app/resources'),
        typings: path.resolve(__dirname, 'app/typings'),
        'global-styles': path.resolve(__dirname, 'app/global-styles'),
        'component-library': path.resolve(__dirname, 'app/component-library'),
        moment: 'moment',
        polished: path.resolve(__dirname, 'node_modules/polished'),
        react: path.resolve(__dirname, 'node_modules/react'),
        'styled-components': path.resolve(
          __dirname,
          'node_modules/styled-components'
        ),
        'react-transition-group': path.resolve(
          __dirname,
          'node_modules/react-transition-group'
        ),
      },
    },
    define: {
      'process.env': {
        NODE_ENV: JSON.stringify(mode),
        CI: JSON.stringify(env.CI),
      },
      moment,
    },
  };
});
