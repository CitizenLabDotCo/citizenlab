const signinCommands = {
  signin(email, password) {
    return this
    .waitForElementVisible('@form')
    .setValue('@email', email)
    .setValue('@password', password)
    .click('@submit')
    .waitForElementNotPresent('@submit');
  },
};


module.exports = {
  url: `http://${process.env.ROOT_URL}/sign-in`,
  elements: {
    form: { selector: '#signin' },
    email: { selector: '#email' },
    password: { selector: '#password' },
    submit: { selector: '#signin button' },
  },
  commands: [signinCommands],
};
