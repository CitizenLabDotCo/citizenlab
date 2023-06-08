import React, { memo } from 'react';

import { IOfficialFeedbackOnreactedInitiativeNotificationData } from 'api/notifications/types';

// i18n
import messages from '../../messages';
import { FormattedMessage } from 'utils/cl-intl';

// components
import NotificationWrapper from '../NotificationWrapper';
import T from 'components/T';

interface Props {
  notification: IOfficialFeedbackOnreactedInitiativeNotificationData;
}

const OfficialFeedbackOnreactedInitiativeNotification = memo<Props>((props) => {
  const { notification } = props;

  return (
    <NotificationWrapper
      linkTo={`/initiatives/${notification.attributes.post_slug}`}
      timing={notification.attributes.created_at}
      icon="comments"
      isRead={!!notification.attributes.read_at}
    >
      <FormattedMessage
        {...messages.officialFeedbackOnreactedInitiative}
        values={{
          officialName: (
            <T value={notification.attributes.official_feedback_author} />
          ),
        }}
      />
    </NotificationWrapper>
  );
});

export default OfficialFeedbackOnreactedInitiativeNotification;
