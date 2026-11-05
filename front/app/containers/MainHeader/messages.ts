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
    id: 'app.containers.app.navbar.logoImgAltText',
    defaultMessage: '{orgName} Home',
  },
  logIn: {
    id: 'app.containers.app.navbar.logIn',
    defaultMessage: 'Log in',
  },
  allProjects: {
    id: 'app.containers.app.navbar.allProjects',
    defaultMessage: 'All projects',
  },
  ariaLabel: {
    id: 'app.containers.app.navbar.ariaLabel',
    defaultMessage: 'Primary',
  },
  // This has to use the same terminology as showMobileNavMenu
  // Both need to be called 'mobile navigation menu'
  // (flagged during a11y audit)
  closeMobileNavMenu: {
    id: 'app.containers.app.navbar.closeMobileNavMenu',
    defaultMessage: 'Close mobile navigation menu',
  },
  fullMobileNavigation: {
    id: 'app.containers.app.navbar.fullMobileNavigation',
    defaultMessage: 'Full mobile',
  },
  // This has to use the same terminology as closeMobileNavMenu
  // Both need to be called 'mobile navigation menu'
  // (flagged during a11y audit)
  showMobileNavMenu: {
    id: 'app.containers.app.navbar.showMobileNavMenu',
    defaultMessage: 'Show mobile navigation menu',
  },
  more: {
    id: 'app.containers.app.navbar.more',
    defaultMessage: 'More',
  },
});
