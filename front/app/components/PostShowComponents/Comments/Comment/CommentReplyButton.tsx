import React, { memo, useCallback } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { get } from 'lodash-es';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

// hooks
import useOpenAuthModal from 'hooks/useOpenAuthModal';

// events
import { commentReplyButtonClicked } from '../events';
import { openVerificationModal } from 'events/verificationModal';

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

    const openAuthModal = useOpenAuthModal();

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
          const authUserIsVerified =
            !isNilOrError(authUser) && authUser.attributes.verified;

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
          } else if (
            !isNilOrError(authUser) &&
            !authUserIsVerified &&
            commentingDisabledReason === 'not_verified'
          ) {
            openVerificationModal({ context });
          } else if (!authUser) {
            openAuthModal({
              verification: commentingDisabledReason === 'not_verified',
              context,
              successAction,
            });
          } else if (commentingDisabledReason === 'not_active') {
            openAuthModal({ context, successAction });
          }
        }

        if (post.type === 'initiative') {
          const authenticationRequirements =
            commentingPermissionInitiative?.authenticationRequirements;

          const context = {
            type: 'initiative',
            action: 'commenting_initiative',
          } as const;

          if (authenticationRequirements === 'sign_in_up') {
            openAuthModal({ context, successAction });
          } else if (authenticationRequirements === 'sign_in_up_and_verify') {
            openAuthModal({ verification: true, context, successAction });
          } else if (authenticationRequirements === 'verify') {
            openVerificationModal({ context });
          } else if (authenticationRequirements === 'complete_registration') {
            openAuthModal({ context, successAction });
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
      openAuthModal,
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
