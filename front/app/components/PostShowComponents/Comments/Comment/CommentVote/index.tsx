import React, { MouseEvent, useState, useEffect } from 'react';

// components
import LikeButton from './LikeButton';

// events
import { triggerAuthenticationFlow } from 'containers/Authentication/events';

// hooks
import useInitiativeById from 'api/initiatives/useInitiativeById';
import useIdeaById from 'api/ideas/useIdeaById';
import useAuthUser from 'api/me/useAuthUser';
import useInitiativesPermissions from 'hooks/useInitiativesPermissions';
import useDeleteCommentVote from 'api/comment_votes/useDeleteCommentVote';
import useAddCommentVote from 'api/comment_votes/useAddCommentVote';
import useCommentVote from 'api/comment_votes/useCommentVote';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { postIsIdea, postIsInitiative } from '../utils';
import { isFixableByAuthentication } from 'utils/actionDescriptors';
import { trackLike, trackCancelLike } from './trackVote';

// typings
import { ICommentData } from 'api/comments/types';
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
  const [reacted, setreacted] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  const initiativeId = postType === 'initiative' ? postId : undefined;
  const ideaId = postType === 'idea' ? postId : undefined;

  const { data: initiative } = useInitiativeById(initiativeId);
  const { data: idea } = useIdeaById(ideaId);
  const { data: authUser } = useAuthUser();

  const { mutate: deleteCommentVote } = useDeleteCommentVote();
  const { mutate: addCommentVote } = useAddCommentVote();
  const { data: commentVote } = useCommentVote(
    comment.relationships.user_vote?.data?.id
  );

  // Wondering why 'comment_reacting_initiative' and not 'commenting_initiative'?
  // See app/api/initiative_action_descriptors/types.ts
  const commentReactingPermissionInitiative = useInitiativesPermissions(
    'comment_reacting_initiative'
  );

  const vote = async () => {
    if (!isNilOrError(authUser)) {
      if (!commentVote) {
        addCommentVote(
          {
            commentId: comment.id,
            userId: authUser.data.id,
            mode: 'up',
          },
          {
            onSuccess: () => {
              trackLike(commentType);
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
              trackCancelLike(commentType);
            },
          }
        );
      }
    }
  };

  const post = postType === 'idea' ? idea?.data : initiative?.data;

  useEffect(() => {
    setreacted(!isNilOrError(commentVote));
  }, [commentVote]);

  useEffect(() => {
    if (!isNilOrError(comment)) {
      const backendLikeCount = comment.attributes.likes_count;

      if (backendLikeCount !== likeCount) {
        setLikeCount(backendLikeCount);
      }
    }
  }, [comment, likeCount]);

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
        alreadyreacted: reacted,
      },
    };

    if (!post) return;

    if (postIsIdea(post)) {
      // Wondering why 'comment_reacting_idea' and not 'commenting_idea'?
      // See app/api/ideas/types.ts
      const actionDescriptor =
        post.attributes.action_descriptor.comment_reacting_idea;

      if (actionDescriptor.enabled) {
        vote();
        return;
      }

      if (isFixableByAuthentication(actionDescriptor.disabled_reason)) {
        // Wondering why 'commenting_idea' and not 'comment_reacting_idea'?
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
        commentReactingPermissionInitiative?.authenticationRequirements;

      if (authenticationRequirements) {
        // Wondering why 'commenting_initiative' and not 'comment_reacting_initiative'?
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
      // Wondering why 'comment_reacting_idea' and not 'commenting_idea'?
      // See app/api/ideas/types.ts
      const { enabled, disabled_reason } =
        post.attributes.action_descriptor.comment_reacting_idea;
      disabled = !enabled && !isFixableByAuthentication(disabled_reason);
    } else {
      disabled = !!commentReactingPermissionInitiative?.enabled;
    }

    if (!disabled || likeCount > 0) {
      return (
        <LikeButton
          className={className}
          disabled={disabled}
          reacted={reacted}
          likeCount={likeCount}
          onClick={handleVoteClick}
        />
      );
    }
  }

  return null;
};

export default CommentVote;
