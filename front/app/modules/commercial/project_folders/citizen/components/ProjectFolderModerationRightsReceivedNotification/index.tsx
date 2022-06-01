import React from 'react';
import { IProjectFolderModerationRightsReceivedNotificationData } from 'services/notifications';
import NotificationWrapper from 'containers/MainHeader/NotificationMenu/components/NotificationWrapper';
import messages from './messages';
import { adminProjectFoldersIndexPath } from '../../../utils/routeUtils';
import { FormattedMessage } from 'utils/cl-intl';
import T from 'components/T';

interface Props {
  notification: IProjectFolderModerationRightsReceivedNotificationData;
}

const ProjectFolderModerationRightsReceivedNotification = ({
  notification,
}: Props) => {
  return (
    <NotificationWrapper
      linkTo={adminProjectFoldersIndexPath(
        notification.attributes.project_folder_id
      )}
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
};

export default ProjectFolderModerationRightsReceivedNotification;
