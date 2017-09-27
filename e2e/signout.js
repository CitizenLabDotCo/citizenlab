module.exports = {
  logout: (browser) => {
    const signinPage = browser.page.signin();

    signinPage
    .navigate()
    .signin('koen@citizenlab.co', 'testtest');

    browser
    .waitForElementVisible('#landing-page')
    .click('#user-menu-container')
    .waitForElementVisible('#user-menu-dropdown')
    .waitForElementVisible('#sign-out-link')
    .click('#sign-out-link')
    .waitForElementVisible('#login-link')
    .end();
  },
};
