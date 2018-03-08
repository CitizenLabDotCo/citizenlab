const glob = require('glob');
const argv = require('yargs').argv;

// Allows the user to select the amount of workers that should be used for parallel running
// `npm run test:e2e -- --workers [number]` or `npm run test:e2e -- -w [number]`
const workers = argv.w || argv.workers || 'auto';

const seleniumServerPattern = './node_modules/selenium-standalone/.selenium/selenium-server/*-server.jar';
const chromeDriverPattern = './node_modules/selenium-standalone/.selenium/chromedriver/*-chromedriver';

module.exports = {
  src_folders: 'e2e/tests',
  page_objects_path: 'e2e/pages',
  output_folder: 'e2e/reports',
  custom_commands_path: 'e2e/commands',
  selenium: {
    start_process: true,
    host: '127.0.0.1',
    port: 4444,
    server_path: glob.sync(seleniumServerPattern)[0],
    cli_args: {
      'webdriver.chrome.driver': glob.sync(chromeDriverPattern)[0],
    },
  },
  test_settings: {
    default: {
      globals: {
        waitForConditionTimeout: 15000,
      },
      detailed_output: false,
      launch_url: `http://${process.env.ROOT_URL}`,
      selenium_port: 4444,
      selenium_host: 'localhost',
      silent: true,
      desiredCapabilities: {
        browserName: 'chrome',
        javascriptEnabled: true,
        acceptSslCerts: true,
      },
    },
  },
  test_workers: {
    workers,
    enabled: true,
  },
};
