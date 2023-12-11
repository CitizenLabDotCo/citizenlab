const { execSync } = require('child_process');
execSync('rm -rf ./internals/jest/cl2-component-library');
execSync('mkdir ./internals/jest/cl2-component-library');
execSync(
  `cp -a ../cl2-component-library/src ./internals/jest/cl2-component-library/src`
);
