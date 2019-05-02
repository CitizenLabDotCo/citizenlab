/*
 * UsersShowPage Messages
 *
 * This contains all the text for the UsersShowPage component.
 */
import { defineMessages } from 'react-intl';

export default defineMessages({
  editProfile: {
    id: 'app.containers.UsersShowPage.editProfile',
    defaultMessage: 'Edit my profile',
  },
  ideasWithCount: {
    id: 'app.containers.UsersShowPage.ideasWithCount',
    defaultMessage: 'Ideas({ideasCount})',
  },
  commentsWithCount: {
    id: 'app.containers.UsersShowPage.commentsWithCount',
    defaultMessage: 'Comments({commentsCount})',
  },
  seeIdea: {
    id: 'app.containers.UsersShowPage.seeIdea',
    defaultMessage: 'See idea',
  },
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
  loadMoreComments: {
    id: 'app.containers.UsersShowPage.loadMoreComments',
    defaultMessage: 'Load more comments',
  },
  loadUserIdeasError: {
    id: 'app.containers.UsersShowPage.loadUserIdeasError',
    defaultMessage: 'User\'s ideas couldn\'t be loaded',
  },
  memberSince: {
    id: 'app.containers.UsersShowPage.memberSince',
    defaultMessage: 'Member since {date}',
  },
  metaTitle: {
    id: 'app.containers.UsersShowPage.metaTitle',
    defaultMessage: 'Profile page of {firstName} {lastName} | CitizenLab',
  },
  metaDescription: {
    id: 'app.containers.UsersShowPage.metaDescription',
    defaultMessage: 'This is the profile page of {firstName} {lastName} on the online participation platform of {tenantName}. Here you can find an overview of the ideas this user.',
  },
});
