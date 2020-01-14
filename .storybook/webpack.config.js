const path = require('path');
const custom = require('../internals/webpack/webpack.config.js');
const createCompiler = require('@storybook/addon-docs/mdx-compiler-plugin');

module.exports = ({ config }) => {
  config.module.rules.push(
    {
      test: /\.(ts|tsx)$/,
      include: path.join(process.cwd(), 'app'),
      use: [
        {
          loader: 'babel-loader'
        },
        {
          loader: 'react-docgen-typescript-loader',
          options: {
            tsconfigPath: path.join(process.cwd(), 'app/tsconfig.json'),
          },
        }
      ],
      exclude: [/\.(stories|story)\.tsx?$/]
    },
    {
      test: /\.(stories|story).tsx?$/,
      include: path.join(process.cwd(), 'app'),
      use: [
        {
          loader: 'babel-loader'
        }
      ],
    },
    {
      test: /\.(stories|story)\.mdx$/,
      use: [
        {
          loader: 'babel-loader'
        },
        {
          loader: '@mdx-js/loader',
          options: {
            compilers: [createCompiler({})],
          },
        },
      ],
    },
    {
      test: /\.(stories|story)\.[tj]sx?$/,
      loader: '@storybook/source-loader',
      exclude: [/node_modules/],
      enforce: 'pre',
    }
  );

  config.resolve.modules = custom.resolve.modules;

  config.resolve.extensions.push('.ts', '.tsx', 'mdx');

  return config;
};
