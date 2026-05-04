import React from 'react';

import { IProjectFolderModerationRightsReceivedNotificationData } from 'api/notifications/types';

import NotificationWrapper from 'containers/MainHeader/Components/NotificationMenu/components/NotificationWrapper';

import T from 'components/T';

import { FormattedMessage } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';
import { stopPropagation } from 'utils/helperUtils';

import messages from './messages';

interface Props {
  notification: IProjectFolderModerationRightsReceivedNotificationData;
}

const ProjectFolderModerationRightsReceivedNotification = ({
  notification,
}: Props) => {
  const projectFolderId = notification.attributes.project_folder_id;

  return (
    <NotificationWrapper
      to="/admin/projects/folders/$projectFolderId"
      params={{ projectFolderId }}
      timing={notification.attributes.created_at}
      icon="folder-solid"
      isRead={!!notification.attributes.read_at}
    >
      <FormattedMessage
        {...messages.youveReceivedFolderManagerRights}
        values={{
          folderLink: (
            <Link
              to="/admin/projects/folders/$projectFolderId"
              params={{ projectFolderId }}
              onClick={stopPropagation}
            >
              <T
                value={notification.attributes.project_folder_title_multiloc}
              />
            </Link>
          ),
        }}
      />
    </NotificationWrapper>
  );
};

export default ProjectFolderModerationRightsReceivedNotification;
