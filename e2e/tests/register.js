const crypto = require('crypto');
const hash = crypto.randomBytes(20).toString('hex');

module.exports = {
  '@tags': ['citizen', 'auth', 'register'],
  register: (browser) => {
    browser
    .url(`http://${process.env.ROOT_URL}/sign-up`)
    .waitForElementVisible('#e2e-signup-step1')
    .setValue('#firstName', `Test ${hash}`)
    .setValue('#lastName', `Account ${hash}`)
    .setValue('#email', `test+${hash}@citizenlab.co`)
    .setValue('#password', '123456789')
    .click('#e2e-signup-step1-button')
    .waitForElementVisible('#e2e-signup-step2-button')
    .pause(500)
    .click('#e2e-signup-step2-button')
    .waitForElementVisible('#e2e-landing-page')
    .click('#e2e-user-menu-container')
    .waitForElementVisible('#e2e-user-menu-dropdown')
    .waitForElementVisible('#e2e-sign-out-link')
    .end();
  },
};
