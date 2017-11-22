module.exports = {
  '@tags': ['citizen', 'auth', 'signout'],
  logout: (browser) => {
    const signinPage = browser.page.signin();

    signinPage
    .navigate()
    .signin('koen@citizenlab.co', 'testtest');

    browser
    .waitForElementVisible('#e2e-landing-page')
    .click('#e2e-user-menu-container')
    .waitForElementVisible('#e2e-user-menu-dropdown')
    .waitForElementVisible('#e2e-sign-out-link')
    .click('#e2e-sign-out-link')
    .waitForElementVisible('#e2e-login-link')
    .end();
  },
};
