const commonCapabilities = {
  project: 'cl2-front',
  build: 'nightwatch-browserstack',
  'browserstack.user': process.env.BROWSERSTACK_USER,
  'browserstack.key': process.env.BROWSERSTACK_KEY,
};

const nwConfig = {
  src_folders: 'e2e/tests',
  page_objects_path: 'e2e/pages',
  output_folder: 'e2e/reports',
  custom_commands_path: 'e2e/commands',

  selenium: {
    start_process: false,
    host: "hub-cloud.browserstack.com",
    port: 80,
  },

  test_settings: {
    default: {
      globals: {
        waitForConditionTimeout: 15000,
      },
      detailed_output: false,
      launch_url: `http://${process.env.ROOT_URL}`,
      desiredCapabilities: {
        ...commonCapabilities,
        browserName: 'internet explorer',
        version: '11',
      },
    },
    chrome: {
      desiredCapabilities: {
        ...commonCapabilities,
        browserName: 'chrome',
      },
    },
    firefox: {
      desiredCapabilities: {
        ...commonCapabilities,
        browserName: 'firefox',
      },
    },
    edge: {
      desiredCapabilities: {
        ...commonCapabilities,
        browserName: 'MicrosoftEdge',
      },
    },
    safari: {
      desiredCapabilities: {
        ...commonCapabilities,
        browserName: 'safari',
      },
    },
  },
};

// Code to copy seleniumhost/port into test settings
Object.keys(nwConfig.test_settings).forEach((i) => {
  const config = nwConfig.test_settings[i];
  config.selenium_host = nwConfig.selenium.host;
  config.selenium_port = nwConfig.selenium.port;
});

module.exports = nwConfig;
