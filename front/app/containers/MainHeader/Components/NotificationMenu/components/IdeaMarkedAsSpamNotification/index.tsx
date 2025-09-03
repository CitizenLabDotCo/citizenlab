import React, { memo } from 'react';

import { IIdeaMarkedAsSpamNotificationData } from 'api/notifications/types';

import T from 'components/T';

import { FormattedMessage } from 'utils/cl-intl';

import messages from '../../messages';
import NotificationWrapper from '../NotificationWrapper';
import UserLink from '../UserLink';

interface Props {
  notification: IIdeaMarkedAsSpamNotificationData;
}

const IdeaMarkedAsSpamNotification = memo<Props>((props) => {
  const { notification } = props;

  return (
    <NotificationWrapper
      linkTo={`/ideas/${notification.attributes.post_slug}`}
      timing={notification.attributes.created_at}
      icon="idea"
      isRead={!!notification.attributes.read_at}
    >
      <FormattedMessage
        {...messages.userMarkedPostAsSpam}
        values={{
          name: (
            <UserLink
              userName={notification.attributes.initiating_user_first_name}
              userSlug={notification.attributes.initiating_user_slug}
            />
          ),
          postTitle: <T value={notification.attributes.post_title_multiloc} />,
        }}
      />
    </NotificationWrapper>
  );
});

export default IdeaMarkedAsSpamNotification;
