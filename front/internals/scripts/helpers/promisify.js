const glob = require('glob');
const fs = require('fs');

const globPromise = (pattern, ignorePattern) =>
  new Promise((resolve, reject) => {
    glob(pattern, { ignore: ignorePattern || [] }, (error, data) => {
      if (error) {
        reject(error);
      } else {
        resolve(data);
      }
    });
  });

const readFilePromise = (fileName) =>
  new Promise((resolve, reject) => {
    fs.readFile(fileName, 'utf8', (error, data) => {
      if (error) {
        reject(error);
      } else {
        resolve(data);
      }
    });
  });

const writeFilePromise = (fileName, data) =>
  new Promise((resolve, reject) => {
    fs.writeFile(fileName, data, (error) => {
      if (error) {
        reject(error);
      } else {
        resolve(data);
      }
    });
  });

module.exports = {
  globPromise,
  readFilePromise,
  writeFilePromise
};
