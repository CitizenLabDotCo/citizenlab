import React, { ReactElement } from 'react';
import {
  TNotificationData,
  IProjectFolderModerationRightsReceivedNotificationData,
} from 'services/notifications';
import NotificationWrapper from 'containers/Navbar/components/NotificationMenu/components/NotificationWrapper';
import messages from './messages';

import { FormattedMessage } from 'utils/cl-intl';
import T from 'components/T';

interface Props {
  notification:
    | TNotificationData
    | IProjectFolderModerationRightsReceivedNotificationData;
}

export default function ProjectFolderModerationRightsReceivedNotification({
  notification,
}: Props): ReactElement | null {
  if (
    notification.attributes.type !== 'project_folder_moderation_rights_received'
  ) {
    return null;
  }

  return (
    <NotificationWrapper
      linkTo={`/admin/projects/folders/${notification.attributes.project_folder_id}`}
      timing={notification.attributes.created_at}
      icon="folder"
      isRead={!!notification.attributes.read_at}
    >
      <FormattedMessage
        {...messages.youveReceivedFolderAdminRights}
        values={{
          folderName: (
            <strong>
              <T
                value={notification.attributes.project_folder_title_multiloc}
              />
            </strong>
          ),
        }}
      />
    </NotificationWrapper>
  );
}
