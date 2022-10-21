import { adminProjectsProjectPath } from 'containers/Admin/projects/routes';
import React, { memo } from 'react';
import { stopPropagation } from 'utils/helperUtils';

// resources
import { IProjectModerationRightsReceivedNotificationData } from 'services/notifications';

// i18n
import T from 'components/T';
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../../messages';

// components
import Link from 'utils/cl-router/Link';
import NotificationWrapper from '../NotificationWrapper';

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
              to={`admin/projects/${notification.attributes.project_id}/ideas`}
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
