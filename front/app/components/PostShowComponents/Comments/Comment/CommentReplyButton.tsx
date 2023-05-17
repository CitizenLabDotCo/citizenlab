import React, { memo, useCallback } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { get } from 'lodash-es';

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
import { postIsIdea, postIsInitiative } from './utils';

// types
import { GetAuthUserChildProps } from 'resources/GetAuthUser';
import { GetInitiativesPermissionsChildProps } from 'resources/GetInitiativesPermissions';
import { IInitiativeData } from 'api/initiatives/types';
import { IIdeaData } from 'api/ideas/types';
import { ICommentData } from 'api/comments/types';
import { SuccessAction } from 'containers/Authentication/SuccessActions/actions';
import { isFixableByAuthentication } from 'utils/actionDescriptors';
import { IUserData } from 'api/users/types';

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
  author?: IUserData;
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
      ? author.attributes.first_name ?? null
      : null;
    const authorLastName = !isNilOrError(author)
      ? author.attributes.last_name ?? null
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

        if (postIsIdea(post)) {
          const {
            clickChildCommentReplyButton,
            clickParentCommentReplyButton,
          } = tracks;

          trackEventByName(
            commentType === 'child'
              ? clickChildCommentReplyButton
              : clickParentCommentReplyButton,
            {
              loggedIn: !!authUser,
            }
          );

          const actionDescriptor =
            post.attributes.action_descriptor.commenting_idea;

          if (actionDescriptor.enabled) {
            reply();
            return;
          }

          if (isFixableByAuthentication(actionDescriptor.disabled_reason)) {
            const context = {
              type: 'idea',
              action: 'commenting_idea',
              id: post.id,
            } as const;

            triggerAuthenticationFlow({ context, successAction });
          }
        }

        if (postIsInitiative(post)) {
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
