/*
 * NotificationMenu Messages
 *
 * This contains all the text for the NotificationMenu component.
 */
import { defineMessages } from 'react-intl';

export default defineMessages({
  loading: {
    id: 'app.containers.NotificationMenu.loading',
    defaultMessage: 'Loading notifications...',
  },
  error: {
    id: 'app.containers.NotificationMenu.error',
    defaultMessage: 'Couldn\'t load notifications',
  },
  loadMore: {
    id: 'app.containers.NotificationMenu.loadMore',
    defaultMessage: 'Load more...',
  },
  clearAll: {
    id: 'app.containers.NotificationMenu.clearAll',
    defaultMessage: 'Clear all',
  },
  noNotifications: {
    id: 'app.containers.NotificationMenu.noNotifications',
    defaultMessage: 'You don\'t have any notifications yet',
  },
  userCommentedOnYourIdea: {
    id: 'app.containers.NotificationMenu.userCommentedOnYourIdea',
    defaultMessage: '{name} commented on your idea',
  },
  userReactedToYourComment: {
    id: 'app.containers.NotificationMenu.userReactedToYourComment',
    defaultMessage: '{name} reacted to your comment',
  },
  mentionInComment: {
    id: 'app.containers.NotificationMenu.mentionInComment',
    defaultMessage: '{name} mentioned you in a comment',
  },
  userMarkedCommentAsSpam: {
    id: 'app.containers.NotificationMenu.userMarkedCommentAsSpam',
    defaultMessage: '{name} reported a comment on \'{ideaTitle}\' as spam',
  },
  userMarkedIdeaAsSpam: {
    id: 'app.containers.NotificationMenu.userMarkedIdeaAsSpam',
    defaultMessage: '{name} reported \'{ideaTitle}\' as spam',
  },
  statusChangedOfYourIdea: {
    id: 'app.containers.NotificationMenu.statusChangedOfYourIdea',
    defaultMessage: '\'{ideaTitle}\' status has changed to {status}',
  },
  userAcceptedYourInvitation: {
    id: 'app.containers.NotificationMenu.userAcceptedYourInvitation',
    defaultMessage: '{name} accepted your invitation',
  },
});
