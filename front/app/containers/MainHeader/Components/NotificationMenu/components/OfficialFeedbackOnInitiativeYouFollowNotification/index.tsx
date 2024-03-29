import React, { memo } from 'react';

import { IOfficialFeedbackOnInitiativeYouFollowNotificationData } from 'api/notifications/types';

import T from 'components/T';

import { FormattedMessage } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';

import messages from '../../messages';
import NotificationWrapper from '../NotificationWrapper';

interface Props {
  notification: IOfficialFeedbackOnInitiativeYouFollowNotificationData;
}

const OfficialFeedbackOnInitiativeYouFollowNotification = memo<Props>(
  (props) => {
    const { notification } = props;

    return (
      <NotificationWrapper
        linkTo={`/initiatives/${notification.attributes.post_slug}`}
        timing={notification.attributes.created_at}
        icon="comments"
        isRead={!!notification.attributes.read_at}
      >
        <FormattedMessage
          {...messages.officialFeedbackOnInitiativeYouFollow}
          values={{
            officialName: (
              <T value={notification.attributes.official_feedback_author} />
            ),
            initiative: (
              <Link to={`/initiatives/${notification.attributes.post_slug}`}>
                <T value={notification.attributes.post_title_multiloc} />
              </Link>
            ),
          }}
        />
      </NotificationWrapper>
    );
  }
);

export default OfficialFeedbackOnInitiativeYouFollowNotification;
