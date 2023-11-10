const fs = require('fs');
const { execSync } = require('child_process');

const build = '../cl2-component-library/dist/cl2-component-library.esm.js';

if (fs.existsSync(build)) {
  execSync(`cp ${build} ./internals/jest/cl2-component-library.esm.js`)
} else {
  console.log('Could not find component library build. Please build the component library first.')
}