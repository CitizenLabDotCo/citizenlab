import React, { memo } from 'react';
// resources
import { IProjectModerationRightsReceivedNotificationData } from 'services/notifications';
import { FormattedMessage } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';
import { stopPropagation } from 'utils/helperUtils';
import { adminProjectsProjectPath } from 'containers/Admin/projects/routes';
import T from 'components/T';
// i18n
import messages from '../../messages';
// components
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
