const path = require('path');
const custom = require('../internals/webpack/webpack.config.js');

module.exports = ({ config }) => {
  config.module.rules.push({
    test: /\.(ts|tsx)$/,
    loader: require.resolve('babel-loader')
  });

  config.resolve.modules = custom.resolve.modules;

  config.resolve.extensions.push('.ts', '.tsx');

  return config;
};
