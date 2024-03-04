import React from 'react';

// events

// analytics

// style
import { colors, fontSizes } from '@citizenlab/cl2-component-library';
import { triggerAuthenticationFlow } from 'containers/Authentication/events';
import { SuccessAction } from 'containers/Authentication/SuccessActions/actions';
import styled from 'styled-components';

import { isFixableByAuthentication } from 'utils/actionDescriptors';
import { trackEventByName } from 'utils/analytics';
import { FormattedMessage } from 'utils/cl-intl';

import { ICommentData } from 'api/comments/types';
import { IIdeaData } from 'api/ideas/types';
import useAuthUser from 'api/me/useAuthUser';
import useUserById from 'api/users/useUserById';

import useInitiativesPermissions from 'hooks/useInitiativesPermissions';

import { commentReplyButtonClicked } from '../events';
import messages from '../messages';
import tracks from '../tracks';

const Container = styled.li`
  display: flex;
  align-items: center;
  list-style: none;
  margin: 0;
  padding: 0;
`;

const ReplyButton = styled.button`
  color: ${colors.textSecondary};
  font-size: ${fontSizes.s}px;
  font-weight: 400;
  white-space: nowrap;
  cursor: pointer;
  padding: 0;
  margin: 0;
  border: none;

  &:hover {
    color: #000;
    text-decoration: underline;
  }
`;

interface Props {
  postType: 'idea' | 'initiative';
  commentId: string;
  commentType: 'parent' | 'child' | undefined;
  authorId: string | null;
  idea?: IIdeaData;
  comment: ICommentData;
  className?: string;
}

const CommentReplyButton = ({
  postType,
  commentType,
  authorId,
  idea,
  comment,
  className,
}: Props) => {
  const { data: authUser } = useAuthUser();
  const commentId = comment.id;
  const parentCommentId = comment.relationships.parent.data?.id ?? null;
  const { data: author } = useUserById(authorId);
  const commentingPermissionInitiative = useInitiativesPermissions(
    'commenting_initiative'
  );

  const authorFirstName = author?.data.attributes.first_name;
  const authorLastName = author?.data.attributes.last_name;
  const authorSlug = author?.data.attributes.slug;

  const reply = () => {
    commentReplyButtonClicked({
      commentId,
      parentCommentId,
      authorFirstName,
      authorLastName,
      authorSlug,
    });
  };

  const onReply = () => {
    const successAction: SuccessAction = {
      name: 'replyToComment',
      params: {
        commentId,
        parentCommentId,
        authorFirstName,
        authorLastName,
        authorSlug,
      },
    };

    const { clickChildCommentReplyButton, clickParentCommentReplyButton } =
      tracks;

    trackEventByName(
      commentType === 'child'
        ? clickChildCommentReplyButton
        : clickParentCommentReplyButton,
      {
        loggedIn: !!authUser,
      }
    );

    if (idea) {
      const actionDescriptor =
        idea.attributes.action_descriptor.commenting_idea;

      if (actionDescriptor.enabled) {
        reply();
        return;
      }

      if (isFixableByAuthentication(actionDescriptor.disabled_reason)) {
        triggerAuthenticationFlow({
          context: {
            type: 'idea',
            action: 'commenting_idea',
            id: idea.id,
          },
          successAction,
        });
      }
    }

    if (postType === 'initiative') {
      const authenticationRequirements =
        commentingPermissionInitiative?.authenticationRequirements;

      if (authenticationRequirements) {
        triggerAuthenticationFlow({
          context: {
            type: 'initiative',
            action: 'commenting_initiative',
          },
          successAction,
        });
      } else if (commentingPermissionInitiative?.enabled === true) {
        reply();
      }
    }
  };

  const ideaCommentingDisabledReason =
    idea?.attributes.action_descriptor.commenting_idea.disabled_reason;

  const isCommentDeleted = comment.attributes.publication_status === 'deleted';
  const disabled =
    postType === 'initiative'
      ? !commentingPermissionInitiative?.enabled
      : ideaCommentingDisabledReason &&
        !isFixableByAuthentication(ideaCommentingDisabledReason);

  if (!isCommentDeleted && !disabled) {
    return (
      <Container className={`reply ${className || ''}`}>
        <ReplyButton onClick={onReply} className="e2e-comment-reply-button">
          <FormattedMessage {...messages.commentReplyButton} />
        </ReplyButton>
      </Container>
    );
  }

  return null;
};

export default CommentReplyButton;
