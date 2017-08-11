import { defineMessages } from 'react-intl';

export default defineMessages({
  title: {
    id: 'app.containers.PasswordReset.title',
    defaultMessage: 'Reset your password',
  },
  emailLabel: {
    id: 'app.containers.PasswordReset.emailLabel',
    defaultMessage: 'Email (required)',
  },
  emailPlaceholder: {
    id: 'app.containers.PasswordReset.emailPlaceholder',
    defaultMessage: 'Enter your email address',
  },
  noEmailError: {
    id: 'app.containers.PasswordReset.noEmailError',
    defaultMessage: 'Please enter your email address',
  },
  noValidEmailError: {
    id: 'app.containers.PasswordReset.noValidEmailError',
    defaultMessage: 'Please enter a valid email address',
  },
  send: {
    id: 'app.containers.PasswordReset.send',
    defaultMessage: 'Send password reset mail',
  },
  submitError: {
    id: 'app.containers.PasswordReset.submitError',
    defaultMessage: 'Something went wrong. Please try again.',
  },
  successMessage: {
    id: 'app.containers.PasswordReset.successMessage',
    defaultMessage: 'Password reset email has been successfully sent',
  },
});
