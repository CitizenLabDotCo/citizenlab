const wp = require('@cypress/webpack-preprocessor')

module.exports = (on) => {
  const options = {
    webpackOptions: require('../../internals/webpack/webpack.config'),
  }
  on('file:preprocessor', wp(options))
}