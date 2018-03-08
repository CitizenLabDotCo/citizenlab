const signinCommands = {
  signin(email, password) {
    return this
    .waitForElementVisible('@form')
    .setValue('@email', email)
    .setValue('@password', password)
    .click('@submit')
    .waitForElementVisible('#e2e-landing-page');
  },
};


module.exports = {
  url: `${process.env.ROOT_URL}/sign-in`,
  elements: {
    form: { selector: '#signin' },
    email: { selector: '#email' },
    password: { selector: '#password' },
    submit: { selector: '#signin button' },
  },
  commands: [signinCommands],
};
