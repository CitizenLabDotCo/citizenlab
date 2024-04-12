import React from 'react';

import { IInitiativeResubmittedForReviewNotificationData } from 'api/notifications/types';

import T from 'components/T';

import { FormattedMessage } from 'utils/cl-intl';

import messages from '../../messages';
import NotificationWrapper from '../NotificationWrapper';

type Props = {
  notification: IInitiativeResubmittedForReviewNotificationData;
};

const InitiativeResubmittedForReviewNotification = ({
  notification,
}: Props) => {
  const getNotificationMessage = (): JSX.Element => {
    const sharedValues = {
      initiativeTitle: (
        <T value={notification.attributes.post_title_multiloc} />
      ),
    };

    return (
      <FormattedMessage
        {...messages.initiativeResubmittedForReview}
        values={{
          ...sharedValues,
        }}
      />
    );
  };

  return (
    <NotificationWrapper
      linkTo={'/admin/initiatives'}
      timing={notification.attributes.created_at}
      icon="initiatives"
      isRead={!!notification.attributes.read_at}
    >
      {getNotificationMessage()}
    </NotificationWrapper>
  );
};

export default InitiativeResubmittedForReviewNotification;
