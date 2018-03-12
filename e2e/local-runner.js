#!/usr/bin/env node

const Nightwatch = require('nightwatch');
const browserstack = require('browserstack-local');
let bsLocal;

try {
  process.mainModule.filename = './node_modules/nightwatch/bin/nightwatch';
  // Code to start browserstack local before start of test
  console.log("Connecting local");
  Nightwatch.bs_local = bsLocal = new browserstack.Local();
  bsLocal.start({ key: process.env.BROWSERSTACK_ACCESS_KEY, forceLocal: true }, (error) => {
    if (error) {
      console.log(error);
      throw error;
    }

    console.log('Connected. Now testing...');
    Nightwatch.cli((argv) => {
      Nightwatch.CliRunner(argv)
        .setup(null, () => {
          // Code to stop browserstack local after end of parallel test
          bsLocal.stop(() => {});
        })
        .runTests(() => {
          // Code to stop browserstack local after end of single test
          bsLocal.stop(() => {});
        });
    });
  });
} catch (ex) {
  console.log('There was an error while starting the test runner:\n\n');
  process.stderr.write(`${ex.stack}
`);
  bsLocal.stop(() => {});
  process.exit(2);
}
