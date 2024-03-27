import { defineMessages } from 'react-intl';

export default defineMessages({
  follow: {
    id: 'app.components.followUnfollow.follow',
    defaultMessage: 'Follow',
  },
  unFollow: {
    id: 'app.components.followUnfollow.unFollow',
    defaultMessage: 'Unfollow',
  },
  followADiscussion: {
    id: 'app.components.followUnfollow.followADiscussion',
    defaultMessage: 'Follow the discussion',
  },
  followTooltipInputPage: {
    id: 'app.components.followUnfollow.followTooltipInputPage',
    defaultMessage:
      'Following will trigger email updates about status changes, official updates, and comments. You can {unsubscribeLink} at any time.',
  },
  followTooltip: {
    id: 'app.components.followUnfollow.followTooltip',
    defaultMessage:
      'Following will trigger email updates about changes. You can {unsubscribeLink} at any time.',
  },
  unsubscribe: {
    id: 'app.components.followUnfollow.unsubscribe',
    defaultMessage: 'unsubscribe',
  },
  unsubscribeUrl: {
    id: 'app.components.followUnfollow.unsubscribeUrl',
    defaultMessage: '/profile/edit',
  },
});
