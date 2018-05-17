const crypto = require('crypto');
const hash = crypto.randomBytes(5).toString('hex');
const newFirstName = `first name ${hash}`;
const newLastName = `last name ${hash}`;
const afterEach = require('../updateBSStatus');

module.exports = {
  '@tags': ['citizen', 'profile', 'edit-profile'],
  afterEach,
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
    .waitForElementVisible('.e2e-profile-edit-form')
    .clearValue('#firstName')
    .pause(200)
    .setValue('#firstName', newFirstName)
    .clearValue('#lastName')
    .pause(200)
    .setValue('#lastName', newLastName)
    .execute('var submitChange = document.getElementsByClassName("e2e-submit-wrapper-button");submitChange[0].scrollIntoView(true);')
    .click('.e2e-submit-wrapper-button button')
    .waitForElementVisible('.success')
    .url(`http://${process.env.ROOT_URL}/profile/edit`)
    .waitForElementVisible('.e2e-profile-edit-form')
    .assert.valueContains('input#firstName', newFirstName)
    .assert.valueContains('input#lastName', newLastName)
    .end();
  },
};
