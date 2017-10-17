import { defineMessages } from 'react-intl';

export default defineMessages({
  title: {
    id: 'app.containers.PasswordRecovery.title',
    defaultMessage: `Forgot your password?  Don't worry, just enter your email address below to receive a password reset link.`,
  },
  emailPlaceholder: {
    id: 'app.containers.PasswordRecovery.emailPlaceholder',
    defaultMessage: 'your e-mail address',
  },
  resetPassword: {
    id: 'app.containers.PasswordRecovery.resetPassword',
    defaultMessage: 'Reset your password',
  },
  successMessage: {
    id: 'app.containers.PasswordRecovery.successMessage',
    defaultMessage: 'Password reset email successfully send. Please check your inbox.',
  },
  emailError: {
    id: 'app.containers.PasswordRecovery.submitError',
    defaultMessage: 'Please enter a valid e-mail address',
  },
  submitError: {
    id: 'app.containers.PasswordRecovery.submitError',
    defaultMessage: 'Something went wrong. Please try again.',
  },
});
