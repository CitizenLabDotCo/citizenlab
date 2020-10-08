import React, { memo, useCallback } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { get } from 'lodash-es';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// events
import { commentReplyButtonClicked } from './events';
import { openSignUpInModal } from 'components/SignUpIn/events';
import { openVerificationModal } from 'components/Verification/verificationModalEvents';

// analytics
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';

// style
import styled from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';

// types
import { GetUserChildProps } from 'resources/GetUser';
import { GetAuthUserChildProps } from 'resources/GetAuthUser';
import { GetCommentChildProps } from 'resources/GetComment';
import { GetPostChildProps } from 'resources/GetPost';
import { GetInitiativesPermissionsChildProps } from 'resources/GetInitiativesPermissions';

const Container = styled.li`
  display: flex;
  align-items: center;
  list-style: none;
  margin: 0;
  padding: 0;
`;

const ReplyButton = styled.button`
  color: ${colors.label};
  font-size: ${fontSizes.small}px;
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
  post: GetPostChildProps;
  comment: GetCommentChildProps;
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
    const onReply = useCallback(() => {
      if (!isNilOrError(post) && !isNilOrError(comment)) {
        const commentId = !isNilOrError(comment) ? comment.id : null;
        const parentCommentId = !isNilOrError(comment)
          ? comment.relationships.parent.data?.id || null
          : null;
        const authorFirstName = !isNilOrError(author)
          ? author.attributes.first_name
          : null;
        const authorLastName = !isNilOrError(author)
          ? author.attributes.last_name
          : null;
        const authorSlug = !isNilOrError(author)
          ? author.attributes.slug
          : null;

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

          if (!isNilOrError(authUser) && !commentingDisabledReason) {
            commentReplyButtonClicked({
              commentId,
              parentCommentId,
              authorFirstName,
              authorLastName,
              authorSlug,
            });
          } else if (
            !isNilOrError(authUser) &&
            !authUserIsVerified &&
            commentingDisabledReason === 'not_verified'
          ) {
            openVerificationModal();
          } else if (!authUser) {
            openSignUpInModal({
              verification: commentingDisabledReason === 'not_verified',
              action: () => onReply(),
            });
          }
        } else {
          if (commentingPermissionInitiative?.action === 'sign_in_up') {
            openSignUpInModal({
              action: () => onReply(),
            });
          } else if (
            commentingPermissionInitiative?.action === 'sign_in_up_and_verify'
          ) {
            openSignUpInModal({
              action: () => onReply(),
              verification: true,
              verificationContext: {
                action: 'commenting_initiative',
                type: 'initiative',
              },
            });
          } else if (commentingPermissionInitiative?.action === 'verify') {
            openVerificationModal({
              context: {
                action: 'commenting_initiative',
                type: 'initiative',
              },
            });
          } else if (commentingPermissionInitiative?.enabled === true) {
            commentReplyButtonClicked({
              commentId,
              parentCommentId,
              authorFirstName,
              authorLastName,
              authorSlug,
            });
          }
        }
      }
    }, [
      authUser,
      author,
      commentType,
      post,
      comment,
      commentingPermissionInitiative,
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
