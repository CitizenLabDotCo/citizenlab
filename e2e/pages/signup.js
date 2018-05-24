const signupCommands = {
  signup(fistName, lastName, email, password) {
    this
    .waitForElementVisible('#e2e-signup-step1')
    .setValue('@firstName', fistName)
    .setValue('@lastName', lastName)
    .clearValue('@email')
    .setValue('@email', email)
    .setValue('@password', password);
    this.api.execute('window.scrollTo(0,document.body.scrollHeight);');
    this.api.pause(100);
    this.click('@termsAndConditions');
    this.click('@submit1')
    .waitForElementPresent('@submit2');
    this.api.pause(100);
    this.api.execute('window.scrollTo(0,document.body.scrollHeight);');
    this.api.pause(100);
    this.click('@submit2');
    return this.waitForElementNotPresent('@submit2');
  },
};


module.exports = {
  url: `http://${process.env.ROOT_URL}/sign-up`,
  elements: {
    form: { selector: '#e2e-signup-step1' },
    email: { selector: '#email' },
    password: { selector: '#password' },
    firstName: { selector: '#firstName' },
    lastName: { selector: '#lastName' },
    submit1: { selector: '#e2e-signup-step1-button' },
    submit2: { selector: '.e2e-signup-step2-button' },
    termsAndConditions: { selector: '.e2e-terms-and-conditions > :first-child' },
  },
  commands: [signupCommands],
};
