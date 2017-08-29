/*
 * UsersPasswordRecovery Messages
 *
 * This contains all the text for the UsersPasswordRecovery component.
 */
import { defineMessages } from 'react-intl';

export default defineMessages({
  header: {
    id: 'app.containers.UsersPasswordRecovery.header',
    defaultMessage: 'Request a reset link',
  },
  submit: {
    id: 'app.containers.UsersPasswordRecovery.submit',
    defaultMessage: 'Submit',
  },
  sent: {
    id: 'app.containers.UsersPasswordRecovery.sent',
    defaultMessage: 'Link sent!',
  },
  notFoundError: {
    id: 'app.containers.UsersPasswordRecovery.notFoundError',
    defaultMessage: 'Not found!',
  },
  helmetTitle: {
    id: 'app.containers.UsersPasswordRecovery.helmetTitle',
    defaultMessage: 'User password recovery page',
  },
  helmetDescription: {
    id: 'app.containers.UsersPasswordRecovery.helmetDescription',
    defaultMessage: 'Email reset link request',
  },
});
