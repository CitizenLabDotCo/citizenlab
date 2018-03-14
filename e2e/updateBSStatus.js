const request = require('request');

module.exports = (browser, done) => {
  const sessionId = browser.capabilities['webdriver.remote.sessionid'];

  if (sessionId && browser.currentTest.results && browser.currentTest.results.failed > 0) {
    request.put({
      uri: `https://api.browserstack.com/automate/sessions/${sessionId}.json`,
      json: true,
      body: { status: 'failed' },
      auth: {
        username: process.env.BROWSERSTACK_USER,
        password: process.env.BROWSERSTACK_KEY,
      },
    }, done);
  } else {
    done();
  }
};

