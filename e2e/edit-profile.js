const crypto = require('crypto');
const hash = crypto.randomBytes(20).toString('hex');
const firstName = `first name ${hash}`;
const lastName = `last name ${hash}`;

module.exports = {
  '@tags': ['citizen', 'profile'],
  editProfile: (browser) => {
    const signinPage = browser.page.signin();

    signinPage
    .navigate()
    .signin('koen@citizenlab.co', 'testtest');

    browser
    .waitForElementVisible('#e2e-landing-page')
    .click('#e2e-user-menu-container')
    .waitForElementVisible('#e2e-user-menu-dropdown')
    .click('#e2e-profile-edit-link')
    .waitForElementVisible('#e2e-profile-edit-form')
    .clearValue('#first_name')
    .setValue('#first_name', firstName)
    .clearValue('#last_name')
    .setValue('#last_name', lastName)
    .click('#e2e-profile-edit-form-button')
    .waitForElementVisible('.ui.message')
    .url('localhost:3000/profile/edit')
    .waitForElementVisible('#e2e-profile-edit-form')
    .getValue('input#first_name', function (result) {
      this.assert.equal(result.value, firstName);
    })
    .getValue('input#last_name', function (result) {
      this.assert.equal(result.value, lastName);
    })
    .end();
  },
};
