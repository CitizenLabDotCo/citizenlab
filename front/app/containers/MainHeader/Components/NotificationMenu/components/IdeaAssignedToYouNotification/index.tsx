import React, { MouseEvent, KeyboardEvent } from 'react';

import useIdeaBySlug from 'api/ideas/useIdeaBySlug';
import { IIdeaAssignedToYouNotificationData } from 'api/notifications/types';

import T from 'components/T';

import { FormattedMessage } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';
import { isNilOrError } from 'utils/helperUtils';

import messages from '../../messages';
import NotificationWrapper from '../NotificationWrapper';

interface Props {
  notification: IIdeaAssignedToYouNotificationData;
}

const IdeaAssignedToYouNotification = ({ notification }: Props) => {
  const { data: idea } = useIdeaBySlug(notification.attributes.post_slug);

  if (!idea) return null;

  const onClickUserName = (event: MouseEvent | KeyboardEvent) => {
    event.stopPropagation();
  };

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

  const projectId = idea.data.relationships.project.data.id;
  const ideaId = idea.data.id;

  return (
    <NotificationWrapper
      linkTo={`/admin/projects/${projectId}/ideas/${ideaId}`}
      timing={notification.attributes.created_at}
      icon="idea"
      isRead={!!notification.attributes.read_at}
    >
      {getNotificationMessage()}
    </NotificationWrapper>
  );
};

export default IdeaAssignedToYouNotification;
