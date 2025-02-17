import React, { memo } from 'react';

import { IInternalCommentNotificationData } from 'api/notifications/types';

import { createHighlighterLink } from 'components/Highlighter';

import { FormattedMessage, MessageDescriptor } from 'utils/cl-intl';

import messages from '../../messages';
import NotificationWrapper from '../NotificationWrapper';
import UserLink from '../UserLink';

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
    case 'internal_comment_on_idea_you_moderate':
      return messages.internalCommentOnIdeaYouModerate;
    case 'internal_comment_on_idea_you_commented_internally_on':
      return messages.internalCommentOnIdeaYouCommentedInternallyOn;
    case 'internal_comment_on_unassigned_unmoderated_idea':
      return messages.internalCommentOnUnassignedUnmoderatedIdea;
  }
};

const InternalCommentNotification = memo<Props>(({ notification }) => {
  const { project_id, idea_id, internal_comment_id } = notification.attributes;
  const linkTo = createHighlighterLink(
    `/admin/projects/${project_id}/ideas/${idea_id}#${internal_comment_id}`
  );

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
          name: (
            <UserLink
              userName={notification.attributes.initiating_user_first_name}
              userSlug={notification.attributes.initiating_user_slug}
            />
          ),
        }}
      />
    </NotificationWrapper>
  );
});

export default InternalCommentNotification;
