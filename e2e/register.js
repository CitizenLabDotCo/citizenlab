module.exports = {
  '@tags': ['citizen', 'auth', 'register'],
  register: (browser) => {
    const time = new Date().getTime();

    browser
    .url('localhost:3000/sign-up')
    .waitForElementVisible('#e2e-signup-step1')
    .setValue('#firstName', `Test ${time}`)
    .setValue('#lastName', `Account ${time}`)
    .setValue('#email', `test+${time}@citizenlab.co`)
    .setValue('#password', '123456')
    .click('#e2e-signup-step1 button')
    .waitForElementVisible('#e2e-signup-step2 button')
    .pause(500)
    .click('#e2e-signup-step2 button')
    .waitForElementVisible('#e2e-landing-page')
    .click('#e2e-user-menu-container')
    .waitForElementVisible('#e2e-user-menu-dropdown')
    .waitForElementVisible('#e2e-sign-out-link')
    .end();
  },
};
