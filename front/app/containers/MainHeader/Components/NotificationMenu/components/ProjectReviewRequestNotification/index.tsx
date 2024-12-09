import React, { memo } from 'react';

import { IProjectReviewRequestNotificationData } from 'api/notifications/types';

import { adminProjectsProjectPath } from 'containers/Admin/projects/routes';

import T from 'components/T';

import { FormattedMessage } from 'utils/cl-intl';

import messages from '../../messages';
import NotificationWrapper from '../NotificationWrapper';
import UserLink from '../UserLink';

type Props = {
  notification: IProjectReviewRequestNotificationData;
};

const ProjectReviewRequestNotification = memo<Props>(
  ({ notification }: Props) => (
    <NotificationWrapper
      linkTo={adminProjectsProjectPath(notification.attributes.project_id)}
      icon="shield-checkered"
      timing={notification.attributes.created_at}
      isRead={!!notification.attributes.read_at}
    >
      <FormattedMessage
        {...messages.projectReviewRequest}
        values={{
          name: (
            <UserLink
              userName={notification.attributes.initiating_user_first_name}
              userSlug={notification.attributes.initiating_user_slug}
            />
          ),
          projectTitle: (
            <T value={notification.attributes.project_title_multiloc} />
          ),
        }}
      />
    </NotificationWrapper>
  )
);

export default ProjectReviewRequestNotification;
