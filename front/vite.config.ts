import path from 'path';

import { sentryVitePlugin } from '@sentry/vite-plugin';
import react from '@vitejs/plugin-react';
import dotenv from 'dotenv';
import { defineConfig } from 'vite';
import checker from 'vite-plugin-checker';
import commonjs from 'vite-plugin-commonjs';
import mkcert from 'vite-plugin-mkcert';
import tsconfigPaths from 'vite-plugin-tsconfig-paths';

// Load environment variables using dotenv
dotenv.config({
  path: path.join(process.cwd(), '../env_files/front-safe.env'),
});

dotenv.config({
  path: path.join(process.cwd(), '../env_files/front-secret.env'),
});

export default defineConfig(({ mode }) => {
  const isDev = mode === 'development';
  const isProd = mode === 'production';
  const isTestBuild = process.env.TEST_BUILD === 'true';
  const sourceMapToSentry = !isDev && !isTestBuild && process.env.CI;

  const API_HOST = process.env.API_HOST || 'localhost';
  const API_PORT = process.env.API_PORT || '4000';
  const GRAPHQL_HOST = process.env.GRAPHQL_HOST || 'localhost';
  const GRAPHQL_PORT = process.env.GRAPHQL_PORT || '5001';
  const DEV_WORKSHOPS_HOST = process.env.DEV_WORKSHOPS_HOST || 'localhost';
  const DEV_WORKSHOPS_PORT = process.env.DEV_WORKSHOPS_PORT || '4005';
  const DEV_LIBRARY_HOST = process.env.DEV_LIBRARY_HOST || 'localhost';
  const DEV_LIBRARY_PORT = process.env.DEV_LIBRARY_PORT || '5005';

  // Determine if HTTPS should be used based on the presence of a HTTPS_HOST
  const HTTPS_HOST = process.env.HTTPS_HOST;
  const USE_HTTPS = HTTPS_HOST !== undefined;
  if (USE_HTTPS) console.log(`\nSecure local dev URL: https://${HTTPS_HOST}`);

  return {
    root: path.resolve(__dirname, 'app'), // Root directory
    base: '/', // Base path for public assets
    server: {
      port: USE_HTTPS ? 443 : Number(process.env.PORT) || 3000,
      host: '0.0.0.0',
      allowedHosts: true,
      watch: {
        ignored: ['**/public/twemoji/**'],
      },
      proxy: {
        '/web_api/': {
          target: `http://${API_HOST}:${API_PORT}`,
          changeOrigin: false,
        },
        '/auth/': {
          target: `http://${API_HOST}:${API_PORT}`,
          changeOrigin: false,
        },
        '/widgets/': {
          target: `http://${API_HOST}:3200`,
          changeOrigin: false,
        },
        '/admin_templates_api': {
          target: `http://${GRAPHQL_HOST}:${GRAPHQL_PORT}`,
          changeOrigin: false,
        },
        '/uploads': {
          target: `http://${API_HOST}:${API_PORT}`,
          changeOrigin: false,
        },
        '/workshops': {
          target: `http://${DEV_WORKSHOPS_HOST}:${DEV_WORKSHOPS_PORT}`,
          changeOrigin: false,
        },
        '/project_library_api': {
          target: `http://${DEV_LIBRARY_HOST}:${DEV_LIBRARY_PORT}`,
          changeOrigin: false,
        },
      },
    },
    plugins: [
      react(),
      commonjs(),
      tsconfigPaths(), // Support for TS path aliases
      checker({
        typescript: {
          tsconfigPath: path.resolve(__dirname, 'app/tsconfig.json'),
        },
        overlay: false,
      }),
      ...[
        sourceMapToSentry &&
          sentryVitePlugin({
            url: 'https://sentry.hq.citizenlab.co/',
            authToken: process.env.SENTRY_AUTH_TOKEN,
            org: 'citizenlab',
            project: 'cl2-front',
            release: {
              name: process.env.CIRCLE_BUILD_NUM,
            },
          }),
        USE_HTTPS && mkcert({ hosts: [HTTPS_HOST] }), // HTTPS in development
      ],
    ],
    build: {
      outDir: '../build',
      sourcemap: !isDev && !isTestBuild,
      minify: isProd,
      rollupOptions: {
        input: path.resolve(__dirname, 'app/index.html'),
        output: {
          entryFileNames: '[name].[hash].min.js', // Generate the main.*.min.js file
          chunkFileNames: '[name].[hash].chunk.js',
          assetFileNames: '[name].[ext]',
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
        NODE_ENV: process.env.NODE_ENV,
        API_HOST: process.env.API_HOST,
        API_PORT: process.env.API_PORT,
        GRAPHQL_HOST: process.env.GRAPHQL_HOST,
        GRAPHQL_PORT: process.env.GRAPHQL_PORT,
        CROWDIN_PLUGIN_ENABLED: !!process.env.CROWDIN_PLUGIN_ENABLED,
        SEGMENT_API_KEY: process.env.SEGMENT_API_KEY,
        INTERCOM_APP_ID: process.env.INTERCOM_APP_ID,
        SENTRY_DSN: process.env.SENTRY_DSN,
        SENTRY_ENV: process.env.SENTRY_ENV,
        CI: process.env.CI,
        CIRCLECI: process.env.CIRCLECI,
        CIRCLE_BUILD_NUM: process.env.CIRCLE_BUILD_NUM,
        CIRCLE_SHA1: process.env.CIRCLE_SHA1,
        CIRCLE_BRANCH: process.env.CIRCLE_BRANCH,
        MATOMO_HOST: process.env.MATOMO_HOST,
        POSTHOG_API_KEY: process.env.POSTHOG_API_KEY,
      },
    },
  };
});
