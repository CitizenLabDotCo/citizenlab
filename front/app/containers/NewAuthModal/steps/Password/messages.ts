import { defineMessages } from 'react-intl';

export default defineMessages({
  logInToYourAccount: {
    id: 'app.containers.NewAuthModal.steps.Password.logInToYourAccount',
    defaultMessage: 'Log in to your account: {account}',
  },
  password: {
    id: 'app.containers.NewAuthModal.steps.Password.password',
    defaultMessage: 'Password',
  },
  noPasswordError: {
    id: 'app.containers.NewAuthModal.steps.Password.noPasswordError',
    defaultMessage: 'Please enter your password',
  },
  forgotPassword: {
    id: 'app.containers.NewAuthModal.steps.Password.forgotPassword',
    defaultMessage: 'Forgot password?',
  },
});
