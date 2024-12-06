import React, { memo } from 'react';

import { IProjectReviewRequestNotificationData } from 'api/notifications/types';

import { adminProjectsProjectPath } from 'containers/Admin/projects/routes';

import T from 'components/T';

import { FormattedMessage } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';
import { isNilOrError, stopPropagation } from 'utils/helperUtils';

import messages from '../../messages';
import { DeletedUser } from '../Notification';
import NotificationWrapper from '../NotificationWrapper';

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

const UserLink = ({ userName, userSlug }) => {
  const deletedUser = isNilOrError(userName) || isNilOrError(userSlug);

  return deletedUser ? (
    <DeletedUser>
      <FormattedMessage {...messages.deletedUser} />
    </DeletedUser>
  ) : (
    <Link to={`/profile/${userSlug}`} onClick={stopPropagation}>
      {userName}
    </Link>
  );
};

export default ProjectReviewRequestNotification;
