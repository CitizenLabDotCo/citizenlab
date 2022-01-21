/*
 * Navbar Messages
 *
 * This contains all the text for the Navbar component.
 */
import { defineMessages } from 'react-intl';

export default defineMessages({
  search: {
    id: 'app.containers.app.navbar.search',
    defaultMessage: 'Search',
  },
  logoAltText: {
    id: 'app.containers.app.navbar.logoAltText',
    defaultMessage: '{orgName} Home page',
  },
  logIn: {
    id: 'app.containers.app.navbar.logIn',
    defaultMessage: 'Log in',
  },
  signUp: {
    id: 'app.containers.app.navbar.signUp',
    defaultMessage: 'Sign up',
  },
  allProjects: {
    id: 'app.containers.app.navbar.allProjects',
    defaultMessage: 'All projects',
  },
});
