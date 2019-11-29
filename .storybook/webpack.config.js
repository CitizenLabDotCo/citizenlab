const path = require('path');
const custom = require('../internals/webpack/webpack.config.js');
const createCompiler = require('@storybook/addon-docs/mdx-compiler-plugin');

module.exports = ({ config }) => {
  config.module.rules.push({
    test: /\.(ts|tsx)$/,
    include: path.resolve(__dirname, '../app'),
    use: [
      {
        loader: require.resolve('babel-loader')
      },
      {
        loader: require.resolve('react-docgen-typescript-loader')
      }
    ],
  });

  config.module.rules.push({
    test: /\.(stories|story)\.mdx$/,
    use: [
      {
        loader: require.resolve('babel-loader'),
        // may or may not need this line depending on your app's setup
        // plugins: ['@babel/plugin-transform-react-jsx'],
      },
      {
        loader: require.resolve('@mdx-js/loader'),
        options: {
          compilers: [createCompiler({})],
        },
      },
    ],
  });

  config.module.rules.push({
    test: /\.(stories|story)\.[tj]sx?$/,
    loader: require.resolve('@storybook/source-loader'),
    exclude: [/node_modules/],
    enforce: 'pre',
  });

  config.resolve.modules = custom.resolve.modules;

  config.resolve.extensions.push('.ts', '.tsx', 'mdx');

  return config;
};
