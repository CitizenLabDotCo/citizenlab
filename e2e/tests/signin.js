const afterEach = require('../updateBSStatus');

module.exports = {
  '@tags': ['citizen', 'auth', 'signin', 'sar'],
  afterEach,
  login: (browser) => {
    const signinPage = browser.page.signin();

    signinPage
    .navigate()
    .signin('koen@citizenlab.co', 'testtest');

    browser
    .waitForElementVisible('#e2e-user-menu-container')
    .click('#e2e-user-menu-container')
    .waitForElementVisible('#e2e-user-menu-dropdown')
    .waitForElementVisible('#e2e-sign-out-link')
    .end();
  },
};
