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
  firstName: {
    id: 'app.containers.UsersEditPage.firstName',
    defaultMessage: 'First Name',
  },
  lastName: {
    id: 'app.containers.UsersEditPage.lastName',
    defaultMessage: 'Last Name',
  },
  email: {
    id: 'app.containers.UsersEditPage.email',
    defaultMessage: 'E-mail',
  },
  gender: {
    id: 'app.containers.UsersEditPage.gender',
    defaultMessage: 'Gender',
  },
  age: {
    id: 'app.containers.UsersEditPage.age',
    defaultMessage: 'Age',
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
  avatarLoadError: {
    id: 'app.containers.UsersEditPage.avatarLoadError',
    defaultMessage: 'Existing avatar coudln\'t be loaded',
  },
  avatarStoreError: {
    id: 'app.containers.UsersEditPage.avatarStoreError',
    defaultMessage: 'Can\'t change avatar right now',
  },
});
