const crypto = require('crypto');
const hash = crypto.randomBytes(20).toString('hex');
const afterEach = require('../updateBSStatus');

module.exports = {
  '@tags': ['citizen', 'auth', 'register'],
  afterEach,
  register: (browser) => {
    const signupPage = browser.page.signup();
    signupPage
    .navigate()
    .signup(`Test ${hash}`, `Account ${hash}`, `test+${hash}@citizenlab.co`, '123456789');
    browser
    .waitForElementVisible('#e2e-landing-page')
    .click('#e2e-user-menu-container')
    .waitForElementVisible('#e2e-user-menu-dropdown')
    .waitForElementVisible('#e2e-sign-out-link')
    .end();
  },
};
