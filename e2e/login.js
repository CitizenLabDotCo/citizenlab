module.exports = {
  login: (browser) => {
    browser
    .url('localhost:3000/sign-in')
    .waitForElementVisible('#signin')
    .setValue('#email', 'koen@citizenlab.co')
    .setValue('#password', 'testtest')
    .click('#signin button')
    .waitForElementVisible('#landing-page')
    .click('#user-menu-container')
    .waitForElementVisible('#user-menu-dropdown')
    .waitForElementVisible('#sign-out-link')
    .end();
  },
};
