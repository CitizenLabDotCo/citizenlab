module.exports = {
  login: (browser) => {
    const signinPage = browser.page.signin();

    signinPage
    .navigate()
    .signin('koen@citizenlab.co', 'testtest');

    browser
    .waitForElementVisible('#e2e-landing-page')
    .click('#e2e-user-menu-container')
    .waitForElementVisible('#e2e-user-menu-dropdown')
    .waitForElementVisible('#e2e-sign-out-link')
    .end();
  },
};
