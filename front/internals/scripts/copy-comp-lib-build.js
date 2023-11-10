const fs = require('fs');
const { execSync } = require('child_process');

const buildFileName = 'cl2-component-library.esm.js';
const compLibBuild = `../cl2-component-library/dist/${buildFileName}`;

// check build in component library
if (fs.existsSync(compLibBuild)) {
  execSync(`cp ${compLibBuild} ./internals/jest/${buildFileName}`);
  return;
}

const nodeModulesBuild = `./node_modules/@citizenlab/cl2-component-library/${buildFileName};`

// check in node_modules
if (fs.existsSync(nodeModulesBuild)) {
  execSync(`cp ${nodeModulesBuild} ./internals/jest/${buildFileName}`);
  return;
}
