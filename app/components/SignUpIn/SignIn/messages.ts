import { defineMessages } from 'react-intl';

export default defineMessages({
  logIn: {
    id: 'app.containers.SignIn.logIn',
    defaultMessage: 'Log in',
  },
  emailLabel: {
    id: 'app.containers.SignIn.emailLabel',
    defaultMessage: 'Email',
  },
  emailOrPhoneLabel: {
    id: 'app.containers.SignIn.emailOrPhoneLabel',
    defaultMessage: 'Email or phone',
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
    defaultMessage: 'Password',
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
  forgotPassword2: {
    id: 'app.containers.SignIn.forgotPassword2',
    defaultMessage: 'Forgot password?',
  },
  backToLoginOptions: {
    id: 'app.containers.SignIn.backToLoginOptions',
    defaultMessage: 'Go back to login options',
  },
  goToSignUp: {
    id: 'app.containers.SignIn.goToSignUp',
    defaultMessage: "Don't have an account? {goToOtherFlowLink}",
  },
  signUp: {
    id: 'app.containers.SignIn.signUp',
    defaultMessage: 'Sign up',
  },
  somethingWentWrongText: {
    id: 'app.containers.SignIn.somethingWentWrong',
    defaultMessage:
      "Something went wrong and we can't sign you in right now. Please try again later.",
  },
});
