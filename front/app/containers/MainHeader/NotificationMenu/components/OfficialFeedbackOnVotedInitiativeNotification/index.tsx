import React, { memo } from 'react';

import { IOfficialFeedbackOnVotedInitiativeNotificationData } from 'services/notifications';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../../messages';

// components
import T from 'components/T';
import NotificationWrapper from '../NotificationWrapper';

interface Props {
  notification: IOfficialFeedbackOnVotedInitiativeNotificationData;
}

const OfficialFeedbackOnVotedInitiativeNotification = memo<Props>((props) => {
  const { notification } = props;

  return (
    <NotificationWrapper
      linkTo={`/initiatives/${notification.attributes.post_slug}`}
      timing={notification.attributes.created_at}
      icon="comments"
      isRead={!!notification.attributes.read_at}
    >
      <FormattedMessage
        {...messages.officialFeedbackOnVotedInitiative}
        values={{
          officialName: (
            <T value={notification.attributes.official_feedback_author} />
          ),
        }}
      />
    </NotificationWrapper>
  );
});

export default OfficialFeedbackOnVotedInitiativeNotification;
