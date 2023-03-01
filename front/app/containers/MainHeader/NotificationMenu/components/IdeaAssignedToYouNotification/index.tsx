import React, { MouseEvent, KeyboardEvent } from 'react';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';
import { IIdeaAssignedToYouNotificationData } from 'services/notifications';
import { get } from 'lodash-es';

// i18n
import messages from '../../messages';
import { FormattedMessage } from 'utils/cl-intl';

// permissions
import { isAdmin, isProjectModerator } from 'services/permissions/roles';

// components
import NotificationWrapper from '../NotificationWrapper';
import Link from 'utils/cl-router/Link';
import T from 'components/T';

// resources
import useIdeaBySlug from 'api/ideas/useIdeaBySlug';
import useAuthUser from 'hooks/useAuthUser';

interface Props {
  notification: IIdeaAssignedToYouNotificationData;
}

const IdeaAssignedToYouNotification = ({ notification }: Props) => {
  const { data: idea } = useIdeaBySlug(notification.attributes.post_slug);
  const onClickUserName = (event: MouseEvent | KeyboardEvent) => {
    event.stopPropagation();
  };
  const authUser = useAuthUser();
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
      if (isAdmin({ data: authUser })) {
        return '/admin/ideas';
      } else if (
        projectId &&
        isProjectModerator({ data: authUser }, projectId)
      ) {
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
