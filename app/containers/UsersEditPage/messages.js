/*
 * UsersEditPage Messages
 *
 * This contains all the text for the UsersEditPage component.
 */
import { defineMessages } from 'react-intl';

export default defineMessages({
  header: {
    id: 'app.containers.UsersEditPage.header',
    defaultMessage: 'Profile',
  },
  first_name: {
    id: 'app.containers.UsersEditPage.first_name',
    defaultMessage: 'First Name',
  },
  last_name: {
    id: 'app.containers.UsersEditPage.last_name',
    defaultMessage: 'Last Name',
  },
  email: {
    id: 'app.containers.UsersEditPage.email',
    defaultMessage: 'E-mail',
  },
  loading: {
    id: 'app.containers.UsersEditPage.loading',
    defaultMessage: 'Loading...',
  },
  processing: {
    id: 'app.containers.UsersEditPage.processing',
    defaultMessage: 'Sending...',
  },
  loadError: {
    id: 'app.containers.UsersEditPage.loadError',
    defaultMessage: 'Can\'t load existing profile',
  },
  storeError: {
    id: 'app.containers.UsersEditPage.storeError',
    defaultMessage: 'Can\'t store updated profile',
  },
  stored: {
    id: 'app.containers.UsersEditPage.stored',
    defaultMessage: 'Profile stored',
  },
  avatarUploadError: {
    id: 'app.containers.UsersEditPage.avatarUploadError',
    defaultMessage: 'Can\'t upload avatar right now',
  },
  dragToUpload: {
    id: 'app.containers.UsersEditPage.dragToUpload',
    defaultMessage: 'Drop to upload new avatar',
  },
  clickToUpload: {
    id: 'app.containers.UsersEditPage.clickToUpload',
    defaultMessage: 'Click',
  },
  submit: {
    id: 'app.containers.UsersEditPage.submit',
    defaultMessage: 'Submit',
  },
  or: {
    id: 'app.containers.UsersEditPage.or',
    defaultMessage: 'or...',
  },
});
