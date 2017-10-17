import { defineMessages } from 'react-intl';

export default defineMessages({
  title: {
    id: 'app.containers.PasswordReset.title',
    defaultMessage: 'Reset your password',
  },
  passwordPlaceholder: {
    id: 'app.containers.PasswordReset.passwordPlaceholder',
    defaultMessage: 'New password',
  },
  passwordError: {
    id: 'app.containers.PasswordReset.passwordError',
    defaultMessage: 'Your password must contain at least 8 characters',
  },
  submitError: {
    id: 'app.containers.PasswordReset.submitError',
    defaultMessage: 'Something went wrong. Please try again.',
  },
  successMessage: {
    id: 'app.containers.PasswordReset.successMessage',
    defaultMessage: 'Your password has been successfully updated',
  },
  updatePassword: {
    id: 'app.containers.PasswordReset.successMessage',
    defaultMessage: 'Update password',
  },
});
