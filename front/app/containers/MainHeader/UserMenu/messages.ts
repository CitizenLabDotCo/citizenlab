/*
 * Navbar Messages
 *
 * This contains all the text for the Navbar component.
 */
import { defineMessages } from 'react-intl';

export default defineMessages({
  myProfile: {
    id: 'app.containers.app.navbar.myProfile',
    defaultMessage: 'My profile',
  },
  editProfile: {
    id: 'app.containers.app.navbar.editProfile',
    defaultMessage: 'Settings',
  },
  signOut: {
    id: 'app.containers.app.navbar.signOut',
    defaultMessage: 'Sign out',
  },
  confirmEmail: {
    id: 'app.containers.Navbar.confirmEmail',
    defaultMessage: 'Confirm email address',
  },
  completeRegistration: {
    id: 'app.containers.Navbar.completeRegistration',
    defaultMessage: 'Complete registration',
  },
  admin: {
    id: 'app.containers.app.navbar.admin',
    defaultMessage: 'Admin',
  },
  verified: {
    id: 'app.containers.Navbar.verified',
    defaultMessage: 'Verified',
  },
  unverified: {
    id: 'app.containers.Navbar.unverified',
    defaultMessage: 'Unverified',
  },
});
