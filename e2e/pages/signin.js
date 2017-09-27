module.exports = {
  url: 'localhost:3000/sign-in',
  elements: {
    form: '#signin',
    email: '#email',
    password: '#password',
    submit: '#signin button',
  },
  commands: [
    {
      signin(email, password) {
        return this
        .waitForElementVisible('@form')
        .setValue('@email', email)
        .setValue('@password', password)
        .click('@submit');
      },
    },
  ],
};
