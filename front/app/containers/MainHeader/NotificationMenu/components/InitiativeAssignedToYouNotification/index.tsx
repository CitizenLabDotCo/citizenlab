import React, { KeyboardEvent, MouseEvent } from 'react';
import { IInitiativeAssignedToYouNotificationData } from 'services/notifications';
import { isNilOrError } from 'utils/helperUtils';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../../messages';

// components
import T from 'components/T';
import Link from 'utils/cl-router/Link';
import NotificationWrapper from '../NotificationWrapper';

type Props = {
  notification: IInitiativeAssignedToYouNotificationData;
};

const InitiativeAssignedToYouNotification = ({ notification }: Props) => {
  const onClickUserName = (event: MouseEvent | KeyboardEvent) => {
    event.stopPropagation();
  };

  const getNotificationMessage = (): JSX.Element => {
    const sharedValues = {
      postTitle: <T value={notification.attributes.post_title_multiloc} />,
    };

    if (isNilOrError(notification.attributes.initiating_user_slug)) {
      return (
        <FormattedMessage
          {...messages.postAssignedToYou}
          values={{
            ...sharedValues,
          }}
        />
      );
    } else {
      return (
        <FormattedMessage
          {...messages.xAssignedPostToYou}
          values={{
            ...sharedValues,
            name: (
              <Link
                to={`/profile/${notification.attributes.initiating_user_slug}`}
                onClick={onClickUserName}
              >
                {notification.attributes.initiating_user_first_name}
              </Link>
            ),
          }}
        />
      );
    }
  };

  return (
    <NotificationWrapper
      linkTo={'/admin/initiatives/manage'}
      timing={notification.attributes.created_at}
      icon="initiatives"
      isRead={!!notification.attributes.read_at}
    >
      {getNotificationMessage()}
    </NotificationWrapper>
  );
};

export default InitiativeAssignedToYouNotification;
