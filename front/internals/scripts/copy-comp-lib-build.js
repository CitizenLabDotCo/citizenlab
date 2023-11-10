const { execSync } = require('child_process');

execSync('cp ../cl2-component-library/dist/cl2-component-library.esm.js ./internals/jest/cl2-component-library.esm.js')