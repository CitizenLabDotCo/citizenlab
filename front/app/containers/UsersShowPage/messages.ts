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
  invisibleTitleUserComments: {
    id: 'app.containers.UsersShowPage.invisibleTitleUserComments',
    defaultMessage: 'All the comments posted by this user',
  },
  invisibleTitlePostsList: {
    id: 'app.containers.UsersShowPage.invisibleTitlePostsList',
    defaultMessage: 'All posts submitted by this participant',
  },
  postsWithCount: {
    id: 'app.containers.UsersShowPage.postsWithCount',
    defaultMessage: 'Posts ({ideasCount})',
  },
  commentsWithCount: {
    id: 'app.containers.UsersShowPage.commentsWithCount',
    defaultMessage: 'Comments ({commentsCount})',
  },
  eventsWithCount: {
    id: 'app.containers.UsersShowPage.eventsWithCount',
    defaultMessage: 'Events ({eventsCount})',
  },
  followingWithCount: {
    id: 'app.containers.UsersShowPage.followingWithCount',
    defaultMessage: 'Following ({followingCount})',
  },
  inputs: {
    id: 'app.containers.UsersShowPage.inputs',
    defaultMessage: 'Inputs',
  },
  projects: {
    id: 'app.containers.UsersShowPage.projects',
    defaultMessage: 'Projects',
  },
  proposals: {
    id: 'app.containers.UsersShowPage.proposals',
    defaultMessage: 'Proposals',
  },
  topics: {
    id: 'app.containers.UsersShowPage.topics',
    defaultMessage: 'Topics',
  },
  areas: {
    id: 'app.containers.UsersShowPage.areas',
    defaultMessage: 'Areas',
  },
  projectFolders: {
    id: 'app.containers.UsersShowPage.projectFolders',
    defaultMessage: 'Project folders',
  },
  emptyInfoText: {
    id: 'app.containers.UsersShowPage.emptyInfoText',
    defaultMessage:
      'You are not following any items of the specified filter above.',
  },
  loadingComments: {
    id: 'app.containers.UsersShowPage.loadingComments',
    defaultMessage: 'Loading user comments...',
  },
  loadingEvents: {
    id: 'app.containers.UsersShowPage.loadingEvents',
    defaultMessage: 'Loading events...',
  },
  tryAgain: {
    id: 'app.containers.UsersShowPage.tryAgain',
    defaultMessage: 'An error has occured, please try again later.',
  },
  noCommentsForYou: {
    id: 'app.containers.UsersShowPage.noCommentsForYou',
    defaultMessage: 'You have not posted any comment yet.',
  },
  noCommentsForUser: {
    id: 'app.containers.UsersShowPage.noCommentsForUser',
    defaultMessage: 'This user has not posted any comment yet.',
  },
  noEvents: {
    id: 'app.containers.UsersShowPage.noEventsForUser',
    defaultMessage: 'You have not attended any events yet.',
  },
  seePost: {
    id: 'app.containers.UsersShowPage.seePost',
    defaultMessage: 'See post',
  },
  loadMoreComments: {
    id: 'app.containers.UsersShowPage.loadMoreComments',
    defaultMessage: 'Load more comments',
  },
  loadMore: {
    id: 'app.containers.UsersShowPage.loadMore',
    defaultMessage: 'Load more',
  },
  memberSince: {
    id: 'app.containers.UsersShowPage.memberSince',
    defaultMessage: 'Member since {date}',
  },
  metaTitle1: {
    id: 'app.containers.UsersShowPage.metaTitle1',
    defaultMessage: 'Profile page of {firstName} {lastName} | {orgName}',
  },
  userShowPageMetaDescription: {
    id: 'app.containers.UsersShowPage.userShowPageMetaDescription',
    defaultMessage:
      'This is the profile page of {firstName} {lastName} on the online participation platform of {orgName}. Here is an overview of all of their posts.',
  },
  a11y_postCommentPostedIn: {
    id: 'app.containers.UsersShowPage.a11y_postCommentPostedIn',
    defaultMessage: 'Post in which this comment was posted: ',
  },
  a11y_likesCount: {
    id: 'app.containers.UsersShowPage.a11y_likesCount',
    defaultMessage:
      '{likesCount, plural, =0 {no likes} one {1 like} other {# likes}}',
  },
});
