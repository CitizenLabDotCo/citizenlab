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
    .url(`http://${process.env.ROOT_URL}/admin/users/invitations`)
    .waitForElementVisible('.e2e-manual-invite')
    .click('.e2e-manual-invite')
    .waitForElementVisible('#emails')
    .setValue('#emails', email)
    .click('#invitation button')
    .waitForElementPresent('.Button.success')
    .assert.containsText('table', email);
  },
  useInvite: (browser) => {
    const signinPage = browser.page.signin();

    signinPage
    .navigate()
    .signin('koen@citizenlab.co', 'testtest');

    browser
    .url(`http://${process.env.ROOT_URL}/admin/users/invitations`)
    .waitForElementVisible('table')
    .getAttribute('table tbody tr', 'class', (token) => {
      browser
      .getText('table tbody tr td', (result) => {
        browser
        .click('#e2e-user-menu-container')
        .waitForElementVisible('#e2e-user-menu-dropdown')
        .waitForElementVisible('#e2e-sign-out-link')
        .click('#e2e-sign-out-link')
        .url(`http://${process.env.ROOT_URL}/invite?token=${token.value}`)
        .waitForElementVisible('#e2e-signup-step1')
        .assert.value('#email', result.value)
        .setValue('#firstName', `Test ${hash}`)
        .setValue('#lastName', `Account ${hash}`)
        .setValue('#password', '123456789')
        .execute('window.scrollTo(0,document.body.scrollHeight);')
        .click('.e2e-terms-and-conditions > :first-child')
        .click('#e2e-signup-step1-button')
        .waitForElementVisible('#e2e-signup-step2-button')
        .pause(500)
        .execute('window.scrollTo(0,document.body.scrollHeight);')
        .pause(500)
        .click('#e2e-signup-step2-button')
        .waitForElementVisible('#e2e-landing-page')
        .click('#e2e-user-menu-container')
        .waitForElementVisible('#e2e-user-menu-dropdown')
        .waitForElementVisible('#e2e-sign-out-link')
        .end();
      });
    });
  },
};
