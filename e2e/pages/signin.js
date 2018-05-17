const signinCommands = {
  signin(email, password) {
    this
    .waitForElementVisible('@form')
    .setValue('@email', email)
    .setValue('@password', password);
    this.api.execute('var submit = document.getElementsByClassName("e2e-submit-signin");submit[0].scrollIntoView(true);');
    this.api.pause(100);
    return this.click('@submit')
    .waitForElementNotPresent('@submit');
  },
};


module.exports = {
  url: `http://${process.env.ROOT_URL}/sign-in`,
  elements: {
    form: { selector: '#signin' },
    email: { selector: '#email' },
    password: { selector: '#password' },
    submit: { selector: '.e2e-submit-signin' },
  },
  commands: [signinCommands],
};
