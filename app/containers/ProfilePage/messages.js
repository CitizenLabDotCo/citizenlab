/*
 * ProfilePage Messages
 *
 * This contains all the text for the ProfilePage component.
 */
import { defineMessages } from 'react-intl';

export default defineMessages({
  header: {
    id: 'app.containers.ProfilePage.header',
    defaultMessage: 'Profile',
  },
  firstName: {
    id: 'app.containers.ProfilePage.firstName',
    defaultMessage: 'First Name',
  },
  lastName: {
    id: 'app.containers.ProfilePage.lastName',
    defaultMessage: 'Last Name',
  },
  email: {
    id: 'app.containers.ProfilePage.email',
    defaultMessage: 'E-mail',
  },
  gender: {
    id: 'app.containers.ProfilePage.gender',
    defaultMessage: 'Gender',
  },
  age: {
    id: 'app.containers.ProfilePage.age',
    defaultMessage: 'Age',
  },
  loading: {
    id: 'app.containers.ProfilePage.loading',
    defaultMessage: 'Loading...',
  },
  processing: {
    id: 'app.containers.ProfilePage.processing',
    defaultMessage: 'Sending...',
  },
  loadError: {
    id: 'app.containers.ProfilePage.loadError',
    defaultMessage: 'Canb\'t load existing profile',
  },
  storeError: {
    id: 'app.containers.ProfilePage.storeError',
    defaultMessage: 'Can\'t store updated profile',
  },
  stored: {
    id: 'app.containers.ProfilePage.store',
    defaultMessage: 'Profile stored',
  },
});
