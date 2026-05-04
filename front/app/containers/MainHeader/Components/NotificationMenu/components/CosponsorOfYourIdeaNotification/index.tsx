import React, { memo } from 'react';

import { ICosponsorOfYourIdeaNotificationData } from 'api/notifications/types';

import { FormattedMessage } from 'utils/cl-intl';

import messages from '../../messages';
import NotificationWrapper from '../NotificationWrapper';
import UserLink from '../UserLink';

interface Props {
  notification: ICosponsorOfYourIdeaNotificationData;
}

const CosponsorOfYourIdeaNotification = memo<Props>((props) => {
  const { notification } = props;
  const slug = notification.attributes.post_slug;

  if (!slug) return null;

  return (
    <NotificationWrapper
      to="/ideas/$slug"
      params={{ slug }}
      timing={notification.attributes.created_at}
      icon="label"
      isRead={!!notification.attributes.read_at}
    >
      <FormattedMessage
        {...messages.cosponsorOfYourIdea}
        values={{
          name: (
            <UserLink
              userName={notification.attributes.initiating_user_first_name}
              userSlug={notification.attributes.initiating_user_slug}
            />
          ),
        }}
      />
    </NotificationWrapper>
  );
});

export default CosponsorOfYourIdeaNotification;
