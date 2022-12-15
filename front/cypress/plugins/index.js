const wp = require('@cypress/webpack-preprocessor');
const path = require('path');
const { rmdir } = require('fs');

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
  on('task', {
    deleteFolder(folderName) {
      console.log('deleting folder %s', folderName);

      return new Promise((resolve, reject) => {
        rmdir(folderName, { maxRetries: 10, recursive: true }, (err) => {
          if (err) {
            console.error(err);
            return reject(err);
          }
          resolve(null);
        });
      });
    },
  });
};
