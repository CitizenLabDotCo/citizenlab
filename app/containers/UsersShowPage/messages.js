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
  memberSince: {
    id: 'app.containers.UsersShowPage.memberSince',
    defaultMessage: 'Member since {date}',
  },
});
