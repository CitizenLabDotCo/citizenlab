const glob = require('glob');

const seleniumServerPattern = './node_modules/selenium-standalone/.selenium/selenium-server/*-server.jar';
const chromeDriverPattern = './node_modules/selenium-standalone/.selenium/chromedriver/*-chromedriver';

module.exports = {
  src_folders: 'e2e',
  page_objects_path: 'e2e/pages',
  output_folder: 'e2e/reports',
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
      launch_url: 'http://localhost:3000',
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
  test_workers: true,
};
