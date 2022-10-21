import React, { memo } from 'react';

import { IOfficialFeedbackOnYourInitiativeNotificationData } from 'services/notifications';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../../messages';

// components
import T from 'components/T';
import Link from 'utils/cl-router/Link';
import NotificationWrapper from '../NotificationWrapper';

interface Props {
  notification: IOfficialFeedbackOnYourInitiativeNotificationData;
}

const OfficialFeedbackOnYourInitiativeNotification = memo<Props>((props) => {
  const { notification } = props;

  return (
    <NotificationWrapper
      linkTo={`/initiatives/${notification.attributes.post_slug}`}
      timing={notification.attributes.created_at}
      icon="comments"
      isRead={!!notification.attributes.read_at}
    >
      <FormattedMessage
        {...messages.officialFeedbackOnYourInitiative}
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
});

export default OfficialFeedbackOnYourInitiativeNotification;
