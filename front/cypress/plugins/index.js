const wp = require('@cypress/webpack-preprocessor');
const path = require('path');
const { rmdir } = require('fs');

module.exports = (on) => {
  // ArcGIS maps require WebGL2. In the GPU-less Cypress container Chrome falls
  // back to software rendering (SwiftShader), which Chrome 137+ disables unless
  // explicitly opted into. Force ANGLE->SwiftShader so WebGL2 is available.
  on('before:browser:launch', (browser, launchOptions) => {
    if (browser.family === 'chromium' && browser.name !== 'electron') {
      launchOptions.args.push('--enable-unsafe-swiftshader');
      launchOptions.args.push('--use-gl=angle');
      launchOptions.args.push('--use-angle=swiftshader');
      launchOptions.args.push('--ignore-gpu-blocklist');
    }
    return launchOptions;
  });

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
