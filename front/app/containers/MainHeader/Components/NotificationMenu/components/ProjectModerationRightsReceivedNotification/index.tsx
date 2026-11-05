import React, { memo } from 'react';

import { IProjectModerationRightsReceivedNotificationData } from 'api/notifications/types';

import { adminProjectsProjectLink } from 'containers/Admin/projects/routes';

import T from 'components/T';

import { FormattedMessage } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';
import { stopPropagation } from 'utils/helperUtils';

import messages from '../../messages';
import NotificationWrapper from '../NotificationWrapper';

interface Props {
  notification: IProjectModerationRightsReceivedNotificationData;
}

const ProjectModerationRightsReceivedNotification = memo<Props>((props) => {
  const { notification } = props;

  return (
    <NotificationWrapper
      {...adminProjectsProjectLink(notification.attributes.project_id)}
      timing={notification.attributes.created_at}
      icon="shield-checkered"
      isRead={!!notification.attributes.read_at}
    >
      <FormattedMessage
        {...messages.projectModerationRightsReceived}
        values={{
          projectLink: (
            <Link
              {...adminProjectsProjectLink(notification.attributes.project_id)}
              onClick={stopPropagation}
            >
              <T value={notification.attributes.project_title_multiloc} />
            </Link>
          ),
        }}
      />
    </NotificationWrapper>
  );
});

export default ProjectModerationRightsReceivedNotification;
