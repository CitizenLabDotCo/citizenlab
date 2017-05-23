/*
 * UsersPasswordReset Messages
 *
 * This contains all the text for the UsersPasswordReset component.
 */
import { defineMessages } from 'react-intl';

export default defineMessages({
  header: {
    id: 'app.containers.UsersPasswordReset.header',
    defaultMessage: 'Type the new password',
  },
  submit: {
    id: 'app.containers.UsersPasswordReset.submit',
    defaultMessage: 'Submit',
  },
  sent: {
    id: 'app.containers.UsersPasswordReset.sent',
    defaultMessage: 'Success! Redirecting...',
  },
  invalidPassword: {
    id: 'app.containers.UsersPasswordReset.invalidPassword',
    defaultMessage: 'Password should be of minimum {minPassLength} characters',
  },
  error: {
    id: 'app.containers.UsersPasswordReset.error',
    defaultMessage: 'Unexpected error',
  },
});
