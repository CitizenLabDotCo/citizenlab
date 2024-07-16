import React, { memo } from 'react';

import { INativeSurveyNotSubmittedNotificationData } from 'api/notifications/types';

import { FormattedMessage } from 'utils/cl-intl';

import messages from '../../messages';
import NotificationWrapper from '../NotificationWrapper';

type Props = {
  notification: INativeSurveyNotSubmittedNotificationData;
};

const NativeSurveyNotSubmittedNotification = memo<Props>((props) => {
  const { notification } = props;

  return (
    <NotificationWrapper
      linkTo={`/projects/${notification.attributes.project_slug}`}
      timing={notification.attributes.created_at}
      icon="vote-ballot"
      isRead={!!notification.attributes.read_at}
    >
      <FormattedMessage {...messages.nativeSurveyNotSubmitted} />
    </NotificationWrapper>
  );
});

export default NativeSurveyNotSubmittedNotification;
