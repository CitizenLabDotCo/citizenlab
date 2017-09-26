module.exports = {
  login: (browser) => {
    browser
    .url('localhost:3000/sign-in')
    .waitForElementVisible('#signin', 5000)
    .setValue('#email', 'koen@citizenlab.co')
    .setValue('#password', 'testtest')
    .click('#signin button')
    .waitForElementVisible('#landing-page', 5000)
    .click('#user-menu-container')
    .waitForElementVisible('#user-menu-dropdown', 5000)
    .waitForElementVisible('#sign-out-link', 5000)
    .end();
  },
};
