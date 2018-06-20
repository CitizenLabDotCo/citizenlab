const crypto = require('crypto');
const hash = crypto.randomBytes(5).toString('hex');
const email = `test-${hash}@citizenlab.co`;
const afterEach = require('../../updateBSStatus');

module.exports = {
  '@tags': ['city', 'invitations'],
  afterEach,
  createInvite: (browser) => {
    const signinPage = browser.page.signin();

    signinPage
      .navigate()
      .signin('koen@citizenlab.co', 'testtest');

    browser
      .url(`http://${process.env.ROOT_URL}/admin/invitations`)
      .waitForElementVisible('.e2e-manual-invite')
      .click('.e2e-manual-invite')
      .waitForElementVisible('#e2e-emails')
      .setValue('#e2e-emails', email)
      .click('.e2e-submit-wrapper-button button')
      .waitForElementPresent('.Button.success')
      .assert.containsText('table', email);
  },
  useInvite: (browser) => {
    const signinPage = browser.page.signin();
    const signupPage = browser.page.signup();

    signinPage
      .navigate()
      .signin('koen@citizenlab.co', 'testtest');

    browser
      .url(`http://${process.env.ROOT_URL}/admin/invitations`)
      .waitForElementVisible('table')
      .getAttribute('table tbody tr', 'class', (token) => {
        browser
          .getText('table tbody tr td', (resEmail) => {
            browser
              .click('#e2e-user-menu-container')
              .waitForElementVisible('#e2e-user-menu-dropdown')
              .waitForElementVisible('#e2e-sign-out-link')
              .click('#e2e-sign-out-link')
              .url(`http://${process.env.ROOT_URL}/invite?token=${token.value}`)
              .waitForElementVisible('#e2e-signup-step1')
              .assert.value('#email', resEmail.value);
            signupPage
              .signup(`Test ${hash}`, `Account ${hash}`, resEmail.value, '123456789');
            browser
              .waitForElementVisible('#e2e-landing-page')
              .click('#e2e-user-menu-container')
              .waitForElementVisible('#e2e-user-menu-dropdown')
              .waitForElementVisible('#e2e-sign-out-link')
              .end();
          });
      });
  },
};
