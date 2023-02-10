import { defineMessages } from 'react-intl';

export default defineMessages({
  helmetTitle: {
    id: 'app.containers.PasswordRecovery.helmetTitle',
    defaultMessage: 'Forgot your password',
  },
  helmetDescription: {
    id: 'app.containers.PasswordRecovery.helmetDescription',
    defaultMessage: 'Forgot your password page',
  },
  title: {
    id: 'app.containers.PasswordRecovery.title',
    defaultMessage: 'Forgot your password?',
  },
  subtitle: {
    id: 'app.containers.PasswordRecovery.subtitle',
    defaultMessage: 'Enter your email below to receive a password reset link.',
  },
  emailPlaceholder: {
    id: 'app.containers.PasswordRecovery.emailPlaceholder',
    defaultMessage: 'My email address',
  },
  emailLabel: {
    id: 'app.containers.PasswordRecovery.emailLabel',
    defaultMessage: 'Email',
  },
  resetPassword: {
    id: 'app.containers.PasswordRecovery.resetPassword',
    defaultMessage: 'Send password reset link',
  },
  passwordResetSuccessMessage: {
    id: 'app.containers.PasswordRecovery.passwordResetSuccessMessage',
    defaultMessage:
      'If this email address is registered on the platform, a password reset link has been sent.',
  },
  emailError: {
    id: 'app.containers.PasswordRecovery.emailError',
    defaultMessage: 'Please enter a valid e-mail address',
  },
  submitError: {
    id: 'app.containers.PasswordRecovery.submitError',
    defaultMessage: 'Something went wrong. Please try again later.',
  },
});
