import { defineMessages } from 'react-intl';

export default defineMessages({
  emailLabel: {
    id: 'app.containers.SignIn.emailLabel',
    defaultMessage: 'Email (required)',
  },
  emailPlaceholder: {
    id: 'app.containers.SignIn.emailPlaceholder',
    defaultMessage: 'Enter your email address',
  },
  noEmailError: {
    id: 'app.containers.SignIn.noEmailError',
    defaultMessage: 'Please enter your email address',
  },
  noValidEmailError: {
    id: 'app.containers.SignIn.noValidEmailError',
    defaultMessage: 'Please enter a valid email address',
  },
  passwordLabel: {
    id: 'app.containers.SignIn.passwordLabel',
    defaultMessage: 'Password (required)',
  },
  passwordPlaceholder: {
    id: 'app.containers.SignIn.passwordPlaceholder',
    defaultMessage: 'Enter a password',
  },
  noPasswordError: {
    id: 'app.containers.SignIn.noPasswordError',
    defaultMessage: 'Please enter a password',
  },
  signInError: {
    id: 'app.containers.SignIn.signInError',
    defaultMessage: 'No account was found for the provided credentials',
  },
  submit: {
    id: 'app.containers.SignIn.submit',
    defaultMessage: 'Log in',
  },
  forgotPassword: {
    id: 'app.containers.SignIn.forgotPassword',
    defaultMessage: 'Forgot password?',
  },
});
