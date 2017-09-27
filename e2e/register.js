module.exports = {
  register: (browser) => {
    const time = new Date().getTime();

    browser
    .url('localhost:3000/sign-up')
    .waitForElementVisible('#signup-step1')
    .setValue('#firstName', `Test ${time}`)
    .setValue('#lastName', `Account ${time}`)
    .setValue('#email', `test+${time}@citizenlab.co`)
    .setValue('#password', '123456')
    .click('#signup-step1 button')
    .waitForElementVisible('#signup-step2')
    .click('#signup-step2 button')
    .waitForElementVisible('#landing-page')
    .end();
  },
};
