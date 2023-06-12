import React, { useCallback } from 'react';
import { isNilOrError } from 'utils/helperUtils';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

// events
import { triggerAuthenticationFlow } from 'containers/Authentication/events';
import { commentReplyButtonClicked } from '../events';

// analytics
import { trackEventByName } from 'utils/analytics';
import tracks from '../tracks';

// style
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';

// utils
import { isFixableByAuthentication } from 'utils/actionDescriptors';

// types
import { IIdeaData } from 'api/ideas/types';
import { ICommentData } from 'api/comments/types';
import { SuccessAction } from 'containers/Authentication/SuccessActions/actions';
import useAuthUser from 'api/me/useAuthUser';
import useUserById from 'api/users/useUserById';
import useInitiativesPermissions from 'hooks/useInitiativesPermissions';

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
  const authorFirstName = !isNilOrError(author)
    ? author.data.attributes.first_name ?? null
    : null;
  const authorLastName = !isNilOrError(author)
    ? author.data.attributes.last_name ?? null
    : null;
  const authorSlug = !isNilOrError(author) ? author.data.attributes.slug : null;

  const reply = useCallback(() => {
    commentReplyButtonClicked({
      commentId,
      parentCommentId,
      authorFirstName,
      authorLastName,
      authorSlug,
    });
  }, [commentId, parentCommentId, authorFirstName, authorLastName, authorSlug]);

  const onReply = useCallback(() => {
    if (!isNilOrError(idea)) {
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

      const actionDescriptor =
        idea.attributes.action_descriptor.commenting_idea;

      if (actionDescriptor.enabled) {
        reply();
        return;
      }

      if (isFixableByAuthentication(actionDescriptor.disabled_reason)) {
        const context = {
          type: 'idea',
          action: 'commenting_idea',
          id: idea.id,
        } as const;

        triggerAuthenticationFlow({ context, successAction });
      }

      if (postType === 'initiative') {
        const authenticationRequirements =
          commentingPermissionInitiative?.authenticationRequirements;

        const context = {
          type: 'initiative',
          action: 'commenting_initiative',
        } as const;

        if (authenticationRequirements) {
          triggerAuthenticationFlow({ context, successAction });
        } else if (commentingPermissionInitiative?.enabled === true) {
          reply();
        }
      }
    }
  }, [
    idea,
    postType,
    authUser,
    commentType,
    commentingPermissionInitiative,
    reply,
    commentId,
    parentCommentId,
    authorFirstName,
    authorLastName,
    authorSlug,
  ]);

  if (!isNilOrError(comment)) {
    const commentingDisabledReason =
      idea?.attributes.action_descriptor.commenting_idea.disabled_reason;

    const isCommentDeleted =
      comment.attributes.publication_status === 'deleted';
    const isSignedIn = !isNilOrError(authUser);
    const disabled =
      postType === 'initiative'
        ? !commentingPermissionInitiative?.enabled
        : isSignedIn &&
          commentingDisabledReason &&
          !isFixableByAuthentication(commentingDisabledReason);

    if (!isCommentDeleted && !disabled) {
      return (
        <Container className={`reply ${className || ''}`}>
          <ReplyButton onClick={onReply} className="e2e-comment-reply-button">
            <FormattedMessage {...messages.commentReplyButton} />
          </ReplyButton>
        </Container>
      );
    }
  }

  return null;
};

export default CommentReplyButton;
