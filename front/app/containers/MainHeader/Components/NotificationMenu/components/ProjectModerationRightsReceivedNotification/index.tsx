import React, { memo } from 'react';
import { stopPropagation } from 'utils/helperUtils';
import { adminProjectsProjectPath } from 'containers/Admin/projects/routes';

// resources
import { IProjectModerationRightsReceivedNotificationData } from 'api/notifications/types';

import messages from '../../messages';
import { FormattedMessage } from 'utils/cl-intl';
import T from 'components/T';

import NotificationWrapper from '../NotificationWrapper';
import Link from 'utils/cl-router/Link';

interface Props {
  notification: IProjectModerationRightsReceivedNotificationData;
}

const ProjectModerationRightsReceivedNotification = memo<Props>((props) => {
  const { notification } = props;

  return (
    <NotificationWrapper
      linkTo={adminProjectsProjectPath(notification.attributes.project_id)}
      timing={notification.attributes.created_at}
      icon="shield-checkered"
      isRead={!!notification.attributes.read_at}
    >
      <FormattedMessage
        {...messages.projectModerationRightsReceived}
        values={{
          projectLink: (
            <Link
              to={adminProjectsProjectPath(notification.attributes.project_id)}
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
