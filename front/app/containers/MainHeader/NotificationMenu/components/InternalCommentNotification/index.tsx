import React, { memo } from 'react';
import { isNilOrError, stopPropagation } from 'utils/helperUtils';

// services
import { IInternalCommentNotificationData } from 'api/notifications/types';

// i18n
import messages from '../../messages';
import { FormattedMessage, MessageDescriptor } from 'utils/cl-intl';

// components
import NotificationWrapper from '../NotificationWrapper';
import Link from 'utils/cl-router/Link';
import { DeletedUser } from '../Notification';

interface Props {
  notification: IInternalCommentNotificationData;
}

const mapPostTypeToLink = (
  notification: IInternalCommentNotificationData
): string | null => {
  switch (notification.attributes.post_type) {
    case 'Idea': {
      // project_id cannot be null for an idea but we need to check it for TS because we have no project_id on initiatives
      if (!notification.attributes.project_id) {
        return null;
      }
      return `/admin/projects/${notification.attributes.project_id}/ideas/${notification.attributes.post_id}`;
    }

    case 'Initiative':
      return `/admin/initiatives/${notification.attributes.post_id}`;
  }
};

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
  const linkTo = mapPostTypeToLink(notification);

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
