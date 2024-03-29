import React from 'react';

import { IProjectFolderModerationRightsReceivedNotificationData } from 'api/notifications/types';

import NotificationWrapper from 'containers/MainHeader/Components/NotificationMenu/components/NotificationWrapper';

import T from 'components/T';

import { FormattedMessage } from 'utils/cl-intl';

import messages from './messages';

interface Props {
  notification: IProjectFolderModerationRightsReceivedNotificationData;
}

const ProjectFolderModerationRightsReceivedNotification = ({
  notification,
}: Props) => {
  return (
    <NotificationWrapper
      linkTo={`/admin/projects/folders/${notification.attributes.project_folder_id}`}
      timing={notification.attributes.created_at}
      icon="folder-solid"
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
};

export default ProjectFolderModerationRightsReceivedNotification;
