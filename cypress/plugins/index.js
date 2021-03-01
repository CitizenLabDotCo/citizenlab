const wp = require('@cypress/webpack-preprocessor');
const path = require('path');

module.exports = (on) => {
  on(
    'file:preprocessor',
    wp({
      webpackOptions: {
        resolve: {
          extensions: ['.ts', '.js'],
        },
        module: {
          rules: [
            {
              test: /\.ts$/,
              exclude: [/node_modules/],
              include: path.join(process.cwd(), 'cypress'),
              use: [
                {
                  loader: 'ts-loader',
                  options: {
                    transpileOnly: true,
                  },
                },
              ],
            },
          ],
        },
      },
    })
  );
};
