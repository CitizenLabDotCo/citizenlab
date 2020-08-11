import React, { memo } from 'react';
import { stopPropagation } from 'utils/helperUtils';

// resources
import { IProjectModerationRightsReceivedNotificationData } from 'services/notifications';

// i18n
import messages from '../../messages';
import { FormattedMessage } from 'utils/cl-intl';
import T from 'components/T';

// components
import NotificationWrapper from '../NotificationWrapper';
import Link from 'utils/cl-router/Link';

interface Props {
  notification: IProjectModerationRightsReceivedNotificationData;
}

const ProjectModerationRightsReceivedNotification = memo<Props>((props) => {
  const { notification } = props;

  return (
    <NotificationWrapper
      linkTo={`/admin/projects/${notification.attributes.project_id}/edit`}
      timing={notification.attributes.created_at}
      icon="admin"
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
