import React, { memo, useCallback } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { get } from 'lodash-es';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

// events
import { triggerAuthenticationFlow } from 'containers/NewAuthModal/events';
import { commentReplyButtonClicked } from '../events';

// analytics
import { trackEventByName } from 'utils/analytics';
import tracks from '../tracks';

// style
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';

// types
import { GetUserChildProps } from 'resources/GetUser';
import { GetAuthUserChildProps } from 'resources/GetAuthUser';
import { GetInitiativesPermissionsChildProps } from 'resources/GetInitiativesPermissions';
import { IInitiativeData } from 'api/initiatives/types';
import { IIdeaData } from 'api/ideas/types';
import { ICommentData } from 'services/comments';
import { SuccessAction } from 'containers/NewAuthModal/SuccessActions/actions';

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
  postId: string;
  postType: 'idea' | 'initiative';
  commentId: string;
  commentType: 'parent' | 'child' | undefined;
  authUser: GetAuthUserChildProps;
  author: GetUserChildProps;
  post: IIdeaData | IInitiativeData;
  comment: ICommentData;
  commentingPermissionInitiative: GetInitiativesPermissionsChildProps;
  className?: string;
}

const TRIGGER_AUTH_FLOW_REASONS = new Set([
  'not_signed_in',
  'not_active',
  'not_verified',
  'not_permitted',
]);

const isReasonToTriggerAuthFlow = (
  commentingDisabledReason?: string | null
) => {
  if (!commentingDisabledReason) return false;
  return TRIGGER_AUTH_FLOW_REASONS.has(commentingDisabledReason);
};

const CommentReplyButton = memo<Props>(
  ({
    postType,
    commentType,
    authUser,
    author,
    post,
    comment,
    commentingPermissionInitiative,
    className,
  }) => {
    const commentId = comment.id;
    const parentCommentId = comment.relationships.parent.data?.id ?? null;
    const authorFirstName = !isNilOrError(author)
      ? author.attributes.first_name
      : null;
    const authorLastName = !isNilOrError(author)
      ? author.attributes.last_name
      : null;
    const authorSlug = !isNilOrError(author) ? author.attributes.slug : null;

    const reply = useCallback(() => {
      commentReplyButtonClicked({
        commentId,
        parentCommentId,
        authorFirstName,
        authorLastName,
        authorSlug,
      });
    }, [
      commentId,
      parentCommentId,
      authorFirstName,
      authorLastName,
      authorSlug,
    ]);

    const onReply = useCallback(() => {
      if (!isNilOrError(post)) {
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

        if (post.type === 'idea') {
          const {
            clickChildCommentReplyButton,
            clickParentCommentReplyButton,
          } = tracks;
          const commentingDisabledReason = get(
            post,
            'attributes.action_descriptor.commenting_idea.disabled_reason'
          );

          trackEventByName(
            commentType === 'child'
              ? clickChildCommentReplyButton
              : clickParentCommentReplyButton,
            {
              loggedIn: !!authUser,
            }
          );

          const context = {
            type: 'idea',
            action: 'commenting_idea',
            id: post.id,
          } as const;

          if (!isNilOrError(authUser) && !commentingDisabledReason) {
            reply();
          } else if (isReasonToTriggerAuthFlow(commentingDisabledReason)) {
            triggerAuthenticationFlow({ context, successAction });
          }
        }

        if (post.type === 'initiative') {
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
      post,
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
      const commentingDisabledReason = get(
        post,
        'attributes.action_descriptor.commenting_idea.disabled_reason'
      );
      const isCommentDeleted =
        comment.attributes.publication_status === 'deleted';
      const isSignedIn = !isNilOrError(authUser);
      const disabled =
        postType === 'initiative'
          ? !commentingPermissionInitiative?.enabled
          : isSignedIn && commentingDisabledReason === 'not_permitted';

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
  }
);

export default CommentReplyButton;
