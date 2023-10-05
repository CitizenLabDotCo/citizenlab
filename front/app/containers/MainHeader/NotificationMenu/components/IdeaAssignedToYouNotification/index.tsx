import React, { MouseEvent, KeyboardEvent } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { IIdeaAssignedToYouNotificationData } from 'api/notifications/types';

// i18n
import messages from '../../messages';
import { FormattedMessage } from 'utils/cl-intl';

// permissions
import { isAdmin, isProjectModerator } from 'utils/permissions/roles';

// components
import NotificationWrapper from '../NotificationWrapper';
import Link from 'utils/cl-router/Link';
import T from 'components/T';

// resources
import useIdeaBySlug from 'api/ideas/useIdeaBySlug';
import useAuthUser from 'api/me/useAuthUser';

interface Props {
  notification: IIdeaAssignedToYouNotificationData;
}

const IdeaAssignedToYouNotification = ({ notification }: Props) => {
  const { data: idea } = useIdeaBySlug(notification.attributes.post_slug);
  const onClickUserName = (event: MouseEvent | KeyboardEvent) => {
    event.stopPropagation();
  };
  const { data: authUser } = useAuthUser();
  const projectId = idea ? idea.data.relationships.project.data.id : null;

  const getNotificationMessage = (): JSX.Element => {
    const sharedValues = {
      postTitle: <T value={notification.attributes.post_title_multiloc} />,
    };

    if (isNilOrError(notification.attributes.initiating_user_slug)) {
      return (
        <FormattedMessage
          {...messages.postAssignedToYou}
          values={{
            ...sharedValues,
          }}
        />
      );
    } else {
      return (
        <FormattedMessage
          {...messages.xAssignedPostToYou}
          values={{
            ...sharedValues,
            name: (
              <Link
                to={`/profile/${notification.attributes.initiating_user_slug}`}
                onClick={onClickUserName}
              >
                {notification.attributes.initiating_user_first_name}
              </Link>
            ),
          }}
        />
      );
    }
  };

  const getLinkTo = () => {
    if (!isNilOrError(authUser)) {
      if (isAdmin(authUser)) {
        return '/admin/ideas';
      } else if (projectId && isProjectModerator(authUser, projectId)) {
        return `/admin/projects/${projectId}/ideas`;
      }
    }

    return null;
  };

  const linkTo = getLinkTo();

  if (linkTo) {
    return (
      <NotificationWrapper
        linkTo={linkTo}
        timing={notification.attributes.created_at}
        icon="idea"
        isRead={!!notification.attributes.read_at}
      >
        {getNotificationMessage()}
      </NotificationWrapper>
    );
  }

  return null;
};

export default IdeaAssignedToYouNotification;
