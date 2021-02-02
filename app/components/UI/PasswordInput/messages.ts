import { defineMessages } from 'react-intl';

export default defineMessages({
  a11y_passwordVisible: {
    id: 'app.components.Modal.a11y_passwordVisible',
    defaultMessage: 'Password visible',
  },
  a11y_passwordHidden: {
    id: 'app.components.Modal.a11y_passwordHidden',
    defaultMessage: 'Password hidden',
  },
  hidePassword: {
    id: 'app.components.Modal.hidePassword',
    defaultMessage: 'Hide password',
  },
  showPassword: {
    id: 'app.components.Modal.showPassword',
    defaultMessage: 'Show password',
  },
  minimumPasswordLengthErrorMessage: {
    id: 'app.components.Modal.minimumPasswordLengthErrorMessage',
    defaultMessage:
      'Your password needs to be at least {minimumPasswordLength} characters long.',
  },
});
