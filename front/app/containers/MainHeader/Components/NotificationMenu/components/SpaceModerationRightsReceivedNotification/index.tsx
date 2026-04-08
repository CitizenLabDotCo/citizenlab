import React, { memo } from 'react';

import { ISpaceModerationRightsReceivedNotificationData } from 'api/notifications/types';

import T from 'components/T';

import { FormattedMessage } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';
import { stopPropagation } from 'utils/helperUtils';

import messages from '../../messages';
import NotificationWrapper from '../NotificationWrapper';

interface Props {
  notification: ISpaceModerationRightsReceivedNotificationData;
}

const SpaceModerationRightsReceivedNotification = memo<Props>((props) => {
  const { notification } = props;
  const spacePath = `/admin/projects/spaces/${notification.attributes.space_id}`;

  return (
    <NotificationWrapper
      linkTo={spacePath}
      timing={notification.attributes.created_at}
      icon="shield-checkered"
      isRead={!!notification.attributes.read_at}
    >
      <FormattedMessage
        {...messages.spaceModerationRightsReceived}
        values={{
          spaceLink: (
            <Link to={spacePath} onClick={stopPropagation}>
              <T value={notification.attributes.space_title_multiloc} />
            </Link>
          ),
        }}
      />
    </NotificationWrapper>
  );
});

export default SpaceModerationRightsReceivedNotification;
