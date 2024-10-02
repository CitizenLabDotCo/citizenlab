import React, { memo } from 'react';

import { RouteType } from 'routes';

import { IInternalCommentNotificationData } from 'api/notifications/types';

import { FormattedMessage, MessageDescriptor } from 'utils/cl-intl';
import Link from 'utils/cl-router/Link';
import { isNilOrError, stopPropagation } from 'utils/helperUtils';

import messages from '../../messages';
import { DeletedUser } from '../Notification';
import NotificationWrapper from '../NotificationWrapper';

interface Props {
  notification: IInternalCommentNotificationData;
}

const getNotificationMessage = (
  notification: IInternalCommentNotificationData
): MessageDescriptor => {
  switch (notification.attributes.type) {
    case 'mention_in_internal_comment':
      return messages.mentionInInternalComment;
    case 'internal_comment_on_your_internal_comment':
      return messages.internalCommentOnYourInternalComment;
    case 'internal_comment_on_idea_assigned_to_you':
      return messages.internalCommentOnIdeaAssignedToYou;
    case 'internal_comment_on_initiative_assigned_to_you':
      return messages.internalCommentOnInitiativeAssignedToYou;
    case 'internal_comment_on_idea_you_moderate':
      return messages.internalCommentOnIdeaYouModerate;
    case 'internal_comment_on_idea_you_commented_internally_on':
      return messages.internalCommentOnIdeaYouCommentedInternallyOn;
    case 'internal_comment_on_initiative_you_commented_internally_on':
      return messages.internalCommentOnInitiativeYouCommentedInternallyOn;
    case 'internal_comment_on_unassigned_unmoderated_idea':
      return messages.internalCommentOnUnassignedUnmoderatedIdea;
    case 'internal_comment_on_unassigned_initiative':
      return messages.internalCommentOnUnassignedInitiative;
  }
};

const InternalCommentNotification = memo<Props>(({ notification }) => {
  const deletedUser =
    isNilOrError(notification.attributes.initiating_user_first_name) ||
    isNilOrError(notification.attributes.initiating_user_slug);
  const { project_id, post_id, internal_comment_id } = notification.attributes;
  const linkTo: RouteType | null = `/admin/projects/${project_id}/ideas/${post_id}#${internal_comment_id}`;

  if (!linkTo) {
    return null;
  }

  return (
    <NotificationWrapper
      linkTo={linkTo}
      timing={notification.attributes.created_at}
      icon={
        notification.attributes.type === 'mention_in_internal_comment'
          ? 'mention'
          : 'comments'
      }
      isRead={!!notification.attributes.read_at}
    >
      <FormattedMessage
        {...getNotificationMessage(notification)}
        values={{
          name: deletedUser ? (
            <DeletedUser>
              <FormattedMessage {...messages.deletedUser} />
            </DeletedUser>
          ) : (
            <Link
              to={`/profile/${notification.attributes.initiating_user_slug}`}
              onClick={stopPropagation}
            >
              {notification.attributes.initiating_user_first_name}
            </Link>
          ),
        }}
      />
    </NotificationWrapper>
  );
});

export default InternalCommentNotification;
