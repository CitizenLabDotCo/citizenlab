/*
 * UsersShowPage Messages
 *
 * This contains all the text for the UsersShowPage component.
 */
import { defineMessages } from 'react-intl';

export default defineMessages({
  loadingUser: {
    id: 'app.containers.UsersShowPage.loadingUser',
    defaultMessage: 'Loading...',
  },
  loadUserError: {
    id: 'app.containers.UsersShowPage.loadUserError',
    defaultMessage: 'User couldn\'t be loaded',
  },
  loadingUserIdeas: {
    id: 'app.containers.UsersShowPage.loadingUserIdeas',
    defaultMessage: 'Loading user ideas...',
  },
  loadUserIdeasError: {
    id: 'app.containers.UsersShowPage.loadUserIdeasError',
    defaultMessage: 'User\'s ideas couldn\'t be loaded',
  },
  helmetTitle: {
    id: 'app.containers.UsersShowPage.helmetTitle',
    defaultMessage: 'User profile page',
  },
  helmetDescription: {
    id: 'app.containers.UsersShowPage.helmetDescription',
    defaultMessage: 'Show user profile',
  },
});
