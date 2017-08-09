import { defineMessages } from 'react-intl';

export default defineMessages({
  title: {
    id: 'app.containers.ForgotPassword.title',
    defaultMessage: 'Forgot your password?',
  },
  emailLabel: {
    id: 'app.containers.ForgotPassword.emailLabel',
    defaultMessage: 'Email (required)',
  },
  emailPlaceholder: {
    id: 'app.containers.ForgotPassword.emailPlaceholder',
    defaultMessage: 'Enter your email address',
  },
  noEmailError: {
    id: 'app.containers.ForgotPassword.noEmailError',
    defaultMessage: 'Please enter your email address',
  },
  noValidEmailError: {
    id: 'app.containers.ForgotPassword.noValidEmailError',
    defaultMessage: 'Please enter a valid email address',
  },
  send: {
    id: 'app.containers.ForgotPassword.send',
    defaultMessage: 'Send password recovery mail',
  },
  submitError: {
    id: 'app.containers.ForgotPassword.submitError',
    defaultMessage: 'Something went wrong. Please try again.',
  },
  successMessage: {
    id: 'app.containers.ForgotPassword.successMessage',
    defaultMessage: 'A password recovery email successfully sent to the provided email address',
  },
});
