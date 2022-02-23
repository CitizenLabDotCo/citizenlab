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
  emailError: {
    id: 'app.containers.SignIn.emailError',
    defaultMessage:
      'Enter an email address in the correct format, like name@example.com',
  },
  passwordLabel: {
    id: 'app.containers.SignIn.passwordLabel',
    defaultMessage: 'Password',
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
