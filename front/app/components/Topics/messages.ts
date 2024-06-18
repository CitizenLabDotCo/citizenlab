import { defineMessages } from 'react-intl';

export default defineMessages({
  topicUpdateError: {
    id: 'app.components.Areas.topicUpdateError',
    defaultMessage:
      'An error occurred while saving your topic. Please try again.',
  },
  followedTopic: {
    id: 'app.components.Areas.followedTopic',
    defaultMessage: 'Followed topic: {topicTitle}',
  },
  unfollowedTopic: {
    id: 'app.components.Areas.unfollowedTopic',
    defaultMessage: 'Unfollowed topic: {topicTitle}',
  },
});
