import React, { MouseEvent, useState, useEffect } from 'react';

// components
import UpvoteButton from './UpvoteButton';

// events
import { triggerAuthenticationFlow } from 'containers/Authentication/events';

// hooks
import useInitiativeById from 'api/initiatives/useInitiativeById';
import useIdeaById from 'api/ideas/useIdeaById';
import useAuthUser from 'hooks/useAuthUser';
import useInitiativesPermissions from 'hooks/useInitiativesPermissions';
import useDeleteCommentVote from 'api/comment_votes/useDeleteCommentVote';
import useAddCommentVote from 'api/comment_votes/useAddCommentVote';
import useCommentVote from 'api/comment_votes/useCommentVote';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { postIsIdea, postIsInitiative } from '../utils';
import { isFixableByAuthentication } from 'utils/actionDescriptors';
import { trackUpvote, trackCancelUpvote } from './trackVote';

// typings
import { ICommentData } from 'services/comments';
import { SuccessAction } from 'containers/Authentication/SuccessActions/actions';

interface Props {
  postId: string;
  postType: 'idea' | 'initiative';
  commentType: 'parent' | 'child' | undefined;
  comment: ICommentData;
  className?: string;
}

const CommentVote = ({
  postId,
  postType,
  comment,
  commentType,
  className,
}: Props) => {
  const [voted, setVoted] = useState(false);
  const [upvoteCount, setUpvoteCount] = useState(0);

  const initiativeId = postType === 'initiative' ? postId : undefined;
  const ideaId = postType === 'idea' ? postId : undefined;

  const { data: initiative } = useInitiativeById(initiativeId);
  const { data: idea } = useIdeaById(ideaId);
  const authUser = useAuthUser();

  const { mutate: deleteCommentVote } = useDeleteCommentVote();
  const { mutate: addCommentVote } = useAddCommentVote();
  const { data: commentVote } = useCommentVote(
    comment.relationships.user_vote?.data?.id
  );

  // Wondering why 'comment_voting_initiative' and not 'commenting_initiative'?
  // See app/api/initiative_action_descriptors/types.ts
  const commentVotingPermissionInitiative = useInitiativesPermissions(
    'comment_voting_initiative'
  );

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
              trackUpvote(commentType);
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
              trackCancelUpvote(commentType);
            },
          }
        );
      }
    }
  };

  const post = postType === 'idea' ? idea?.data : initiative?.data;

  useEffect(() => {
    setVoted(!isNilOrError(commentVote));
  }, [commentVote]);

  useEffect(() => {
    if (!isNilOrError(comment)) {
      const backendUpvoteCount = comment.attributes.upvotes_count;

      if (backendUpvoteCount !== upvoteCount) {
        setUpvoteCount(backendUpvoteCount);
      }
    }
  }, [comment, upvoteCount]);

  const handleVoteClick = async (event?: MouseEvent) => {
    event?.preventDefault();

    const successAction: SuccessAction = {
      name: 'voteOnComment',
      params: {
        commentId: comment.id,
        commentType,
        commentVoteId: isNilOrError(commentVote)
          ? undefined
          : commentVote.data.id,
        alreadyVoted: voted,
      },
    };

    if (!post) return;

    if (postIsIdea(post)) {
      // Wondering why 'comment_voting_idea' and not 'commenting_idea'?
      // See app/api/ideas/types.ts
      const actionDescriptor =
        post.attributes.action_descriptor.comment_voting_idea;

      if (actionDescriptor.enabled) {
        vote();
        return;
      }

      if (isFixableByAuthentication(actionDescriptor.disabled_reason)) {
        // Wondering why 'commenting_idea' and not 'comment_voting_idea'?
        // See app/api/ideas/types.ts
        const context = {
          type: 'idea',
          action: 'commenting_idea',
          id: postId,
        } as const;

        triggerAuthenticationFlow({
          context,
          successAction,
        });
      }
    }

    if (postIsInitiative(post)) {
      const authenticationRequirements =
        commentVotingPermissionInitiative?.authenticationRequirements;

      if (authenticationRequirements) {
        // Wondering why 'commenting_initiative' and not 'comment_voting_initiative'?
        // See app/api/initiative_action_descriptors/types.ts
        const context = {
          action: 'commenting_initiative',
          type: 'initiative',
        } as const;

        triggerAuthenticationFlow({
          context,
          successAction,
        });
      } else {
        vote();
      }
    }
  };

  if (!isNilOrError(comment) && post) {
    let disabled: boolean;

    if (postIsIdea(post)) {
      // Wondering why 'comment_voting_idea' and not 'commenting_idea'?
      // See app/api/ideas/types.ts
      const { enabled, disabled_reason } =
        post.attributes.action_descriptor.comment_voting_idea;
      disabled = !enabled && !isFixableByAuthentication(disabled_reason);
    } else {
      disabled = !!commentVotingPermissionInitiative?.enabled;
    }

    if (!disabled || upvoteCount > 0) {
      return (
        <UpvoteButton
          className={className}
          disabled={disabled}
          voted={voted}
          upvoteCount={upvoteCount}
          onClick={handleVoteClick}
        />
      );
    }
  }

  return null;
};

export default CommentVote;
