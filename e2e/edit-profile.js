module.exports = {
  editProfile: (browser) => {
    const firstName = `first name ${new Date().getTime()}`;
    const lastName = `last name ${new Date().getTime()}`;
    const signinPage = browser.page.signin();

    signinPage
    .navigate()
    .signin('koen@citizenlab.co', 'testtest');

    browser
    .waitForElementVisible('#landing-page')
    .click('#user-menu-container')
    .waitForElementVisible('#user-menu-dropdown')
    .click('#profile-edit-link')
    .waitForElementVisible('#profile-edit-form')
    .clearValue('#first_name')
    .setValue('#first_name', firstName)
    .clearValue('#last_name')
    .setValue('#last_name', lastName)
    .click('#profile-edit-form button')
    .waitForElementVisible('.ui.message')
    .url('localhost:3000/profile/edit')
    .waitForElementVisible('#profile-edit-form')
    .getValue('input#first_name', function (result) {
      this.assert.equal(result.value, firstName);
    })
    .getValue('input#last_name', function (result) {
      this.assert.equal(result.value, lastName);
    })
    .end();
  },
};
