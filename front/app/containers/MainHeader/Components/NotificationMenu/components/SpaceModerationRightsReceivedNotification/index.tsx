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
  const spaceId = notification.attributes.space_id;

  return (
    <NotificationWrapper
      linkTo={`/admin/projects/spaces/${spaceId}`}
      timing={notification.attributes.created_at}
      icon="shield-checkered"
      isRead={!!notification.attributes.read_at}
    >
      <FormattedMessage
        {...messages.spaceModerationRightsReceived}
        values={{
          spaceLink: (
            <Link
              to="/$locale/admin/projects/spaces/$spaceId"
              params={{ spaceId }}
              onClick={stopPropagation}
            >
              <T value={notification.attributes.space_title_multiloc} />
            </Link>
          ),
        }}
      />
    </NotificationWrapper>
  );
});

export default SpaceModerationRightsReceivedNotification;
