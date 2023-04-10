import React, { MouseEvent } from 'react';
import { isNilOrError } from 'utils/helperUtils';

// components
import { Icon } from '@citizenlab/cl2-component-library';

import useDeleteCommentVote from 'api/comment_votes/useDeleteCommentVote';
import useAddCommentVote from 'api/comment_votes/useAddCommentVote';
import useCommentVote from 'api/comment_votes/useCommentVote';
import { ICommentData } from 'api/comments/types';

// resources

// analytics
import { trackEventByName } from 'utils/analytics';
import tracks from './tracks';

// events
import { openSignUpInModal } from 'events/openSignUpInModal';
import { openVerificationModal } from 'events/verificationModal';

// i18n
import { useIntl } from 'utils/cl-intl';
import messages from './messages';

// style
import styled from 'styled-components';
import { colors, fontSizes, isRtl } from 'utils/styleUtils';
import { lighten } from 'polished';

// a11y
import { ScreenReaderOnly } from 'utils/a11y';

// hooks
import useInitiativeById from 'api/initiatives/useInitiativeById';
import useIdeaById from 'api/ideas/useIdeaById';
import useAuthUser from 'hooks/useAuthUser';
import useInitiativesPermissions from 'hooks/useInitiativesPermissions';

const Container = styled.li`
  display: flex;
  align-items: center;
  list-style: none;
  margin: 0;
  margin-left: 1px;
  padding: 0;
`;

const UpvoteIcon = styled(Icon)`
  fill: ${colors.textSecondary};
  flex: 0 0 20px;
  width: 20px;
  height: 20px;
`;

const UpvoteButton = styled.button`
  color: ${colors.textSecondary};
  font-size: ${fontSizes.s}px;
  font-weight: 400;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  margin: 0;
  padding: 0;
  border: none;
  cursor: pointer;

  &.disabled {
    cursor: auto;
  }

  &.enabled:not(.voted):hover {
    color: #000;

    ${UpvoteIcon} {
      fill: #000;
    }
  }

  &.enabled.voted {
    color: ${colors.success};

    ${UpvoteIcon} {
      fill: ${colors.success};
    }
  }

  &.disabled:not(.voted) {
    color: ${lighten(0.25, colors.textSecondary)};

    ${UpvoteIcon} {
      fill: ${lighten(0.25, colors.textSecondary)};
    }
  }

  &.disabled.voted {
    color: ${lighten(0.25, colors.success)};

    ${UpvoteIcon} {
      fill: ${lighten(0.25, colors.success)};
    }
  }
`;

const UpvoteCount = styled.div`
  margin-left: 6px;
  ${isRtl`
    margin-right: 6px;
    margin-left: auto;
  `}
`;

interface Props {
  postId: string;
  postType: 'idea' | 'initiative';
  commentType: 'parent' | 'child' | undefined;
  className?: string;
  comment: ICommentData;
}

const CommentVote = ({
  comment,
  postId,
  postType,
  commentType,
  className,
}: Props) => {
  const { formatMessage } = useIntl();
  const authUser = useAuthUser();
  const commentVotingPermissionInitiative = useInitiativesPermissions(
    'comment_voting_initiative'
  );
  const { mutate: deleteCommentVote } = useDeleteCommentVote();
  const { mutate: addCommentVote } = useAddCommentVote();
  const { data: commentVote } = useCommentVote(
    comment.relationships.user_vote?.data?.id
  );

  const initiativeId = postType === 'initiative' ? postId : undefined;
  const ideaId = postType === 'idea' ? postId : undefined;
  const { data: initiative } = useInitiativeById(initiativeId);
  const { data: idea } = useIdeaById(ideaId);

  const post = postType === 'idea' ? idea?.data : initiative?.data;

  const upvoteCount = !isNilOrError(comment)
    ? comment.attributes.upvotes_count
    : 0;

  const vote = async () => {
    if (!isNilOrError(authUser)) {
      if (!commentVote) {
        addCommentVote(
          {
            commentId: comment.id,
            userId: authUser.id,
            mode: 'up',
          },
          {
            onSuccess: () => {
              if (commentType === 'parent') {
                trackEventByName(tracks.clickParentCommentUpvoteButton);
              } else if (commentType === 'child') {
                trackEventByName(tracks.clickChildCommentUpvoteButton);
              } else {
                trackEventByName(tracks.clickCommentUpvoteButton);
              }
            },
          }
        );
      }

      if (commentVote) {
        deleteCommentVote(
          {
            commentId: comment.id,
            voteId: commentVote.data.id,
          },
          {
            onSuccess: () => {
              if (commentType === 'parent') {
                trackEventByName(tracks.clickParentCommentCancelUpvoteButton);
              } else if (commentType === 'child') {
                trackEventByName(tracks.clickChildCommentCancelUpvoteButton);
              } else {
                trackEventByName(tracks.clickCommentCancelUpvoteButton);
              }
            },
          }
        );
      }
    }
  };

  const handleVoteClick = async (event?: MouseEvent) => {
    event?.preventDefault();

    const commentingDisabledReason =
      post?.attributes && 'action_descriptor' in post.attributes
        ? post?.attributes.action_descriptor.commenting_idea.disabled_reason
        : undefined;

    const authUserIsVerified =
      !isNilOrError(authUser) && authUser.attributes.verified;

    if (postType === 'idea') {
      if (!isNilOrError(authUser) && !commentingDisabledReason) {
        vote();
      } else if (
        !isNilOrError(authUser) &&
        !authUserIsVerified &&
        commentingDisabledReason === 'not_verified'
      ) {
        openVerificationModal();
      } else if (!authUser) {
        openSignUpInModal({
          verification: commentingDisabledReason === 'not_verified',
          action: () => handleVoteClick(),
        });
      }
    } else {
      if (commentVotingPermissionInitiative?.action === 'sign_in_up') {
        openSignUpInModal({
          action: () => handleVoteClick(),
        });
      } else if (
        commentVotingPermissionInitiative?.action === 'sign_in_up_and_verify'
      ) {
        openSignUpInModal({
          action: () => handleVoteClick(),
          verification: true,
          verificationContext: {
            action: 'commenting_initiative',
            type: 'initiative',
          },
        });
      } else if (commentVotingPermissionInitiative?.action === 'verify') {
        openVerificationModal({
          context: {
            action: 'commenting_initiative',
            type: 'initiative',
          },
        });
      } else if (commentVotingPermissionInitiative?.enabled === true) {
        vote();
      }
    }
  };

  const commentingVotingDisabledReason =
    post?.attributes && 'action_descriptor' in post.attributes
      ? post?.attributes.action_descriptor.comment_voting_idea.disabled_reason
      : undefined;

  const isSignedIn = !isNilOrError(authUser);
  const disabled =
    postType === 'initiative'
      ? !commentVotingPermissionInitiative?.enabled
      : isSignedIn && commentingVotingDisabledReason === 'not_permitted';

  if (!disabled || upvoteCount > 0) {
    return (
      <Container className={`vote ${className || ''}`}>
        <UpvoteButton
          onClick={handleVoteClick}
          disabled={disabled}
          className={`
              e2e-comment-vote
              ${commentVote ? 'voted' : 'notVoted'}
              ${disabled ? 'disabled' : 'enabled'}
            `}
        >
          <>
            <UpvoteIcon
              name="vote-up"
              className={`
                ${commentVote ? 'voted' : 'notVoted'}
                ${disabled ? 'disabled' : 'enabled'}
              `}
            />
            <ScreenReaderOnly>
              {!commentVote
                ? formatMessage(messages.upvoteComment)
                : formatMessage(messages.a11y_undoUpvote)}
            </ScreenReaderOnly>
          </>
          {upvoteCount > 0 && (
            <UpvoteCount
              className={`
              ${commentVote ? 'voted' : 'notVoted'}
              ${disabled ? 'disabled' : 'enabled'}
            `}
            >
              {upvoteCount}
            </UpvoteCount>
          )}
        </UpvoteButton>
        <ScreenReaderOnly aria-live="polite">
          {formatMessage(messages.a11y_upvoteCount, {
            upvoteCount,
          })}
        </ScreenReaderOnly>
      </Container>
    );
  }
  return null;
};

export default CommentVote;
