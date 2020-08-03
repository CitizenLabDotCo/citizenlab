import React, { memo } from 'react';

import { IOfficialFeedbackOnCommentedInitiativeNotificationData } from 'services/notifications';

// i18n
import messages from '../../messages';
import { FormattedMessage } from 'utils/cl-intl';

// components
import NotificationWrapper from '../NotificationWrapper';
import T from 'components/T';

interface Props {
  notification: IOfficialFeedbackOnCommentedInitiativeNotificationData;
}

const OfficialFeedbackOnCommentedInitiativeNotification = memo<Props>(
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
          {...messages.officialFeedbackOnCommentedInitiative}
          values={{
            officialName: (
              <T value={notification.attributes.official_feedback_author} />
            ),
          }}
        />
      </NotificationWrapper>
    );
  }
);

export default OfficialFeedbackOnCommentedInitiativeNotification;
