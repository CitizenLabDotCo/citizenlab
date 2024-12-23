import React, { MouseEvent, useState, useEffect } from 'react';

import useAddCommentReaction from 'api/comment_reactions/useAddCommentReaction';
import useCommentReaction from 'api/comment_reactions/useCommentReaction';
import useDeleteCommentReaction from 'api/comment_reactions/useDeleteCommentReaction';
import { ICommentData } from 'api/comments/types';
import useIdeaById from 'api/ideas/useIdeaById';
import useAuthUser from 'api/me/useAuthUser';

import { triggerAuthenticationFlow } from 'containers/Authentication/events';
import { SuccessAction } from 'containers/Authentication/SuccessActions/actions';

import { isFixableByAuthentication } from 'utils/actionDescriptors';
import { isNilOrError } from 'utils/helperUtils';

import LikeButton from './LikeButton';
import { trackLike, trackCancelLike } from './trackReaction';

interface Props {
  ideaId: string | undefined;
  commentType: 'parent' | 'child' | undefined;
  comment: ICommentData;
  className?: string;
}

const CommentReaction = ({
  ideaId,
  comment,
  commentType,
  className,
}: Props) => {
  const [reacted, setReacted] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const { data: idea } = useIdeaById(ideaId);
  const { data: authUser } = useAuthUser();

  const { mutate: deleteCommentReaction } = useDeleteCommentReaction();
  const { mutate: addCommentReaction } = useAddCommentReaction();
  const { data: commentReaction } = useCommentReaction(
    comment.relationships.user_reaction?.data?.id
  );

  const reaction = async () => {
    if (!isNilOrError(authUser)) {
      if (!commentReaction) {
        addCommentReaction(
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

      if (commentReaction) {
        deleteCommentReaction(
          {
            commentId: comment.id,
            reactionId: commentReaction.data.id,
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

  useEffect(() => {
    setReacted(!isNilOrError(commentReaction));
  }, [commentReaction]);

  useEffect(() => {
    if (!isNilOrError(comment)) {
      const backendLikeCount = comment.attributes.likes_count;

      if (backendLikeCount !== likeCount) {
        setLikeCount(backendLikeCount);
      }
    }
  }, [comment, likeCount]);

  const handleReactionClick = async (event?: MouseEvent) => {
    event?.preventDefault();

    const successAction: SuccessAction = {
      name: 'reactionOnComment',
      params: {
        commentId: comment.id,
        commentType,
        commentReactionId: isNilOrError(commentReaction)
          ? undefined
          : commentReaction.data.id,
        alreadyReacted: reacted,
      },
    };

    if (ideaId && idea) {
      // Wondering why 'comment_reacting_idea' and not 'commenting_idea'?
      // See app/api/ideas/types.ts
      const actionDescriptor =
        idea.data.attributes.action_descriptors.comment_reacting_idea;

      if (actionDescriptor.enabled) {
        reaction();
        return;
      }

      if (isFixableByAuthentication(actionDescriptor.disabled_reason)) {
        // Wondering why 'commenting_idea' and not 'comment_reacting_idea'?
        // See app/api/ideas/types.ts
        const context = {
          type: 'idea',
          action: 'commenting_idea',
          id: ideaId,
        } as const;

        triggerAuthenticationFlow({
          context,
          successAction,
        });
      }
    }
  };

  if (!isNilOrError(comment)) {
    let disabled: boolean = false;

    if (idea) {
      const { enabled, disabled_reason } =
        idea.data.attributes.action_descriptors.comment_reacting_idea;
      disabled = !enabled && !isFixableByAuthentication(disabled_reason);
    }

    if (!disabled || likeCount > 0) {
      return (
        <LikeButton
          className={className}
          disabled={disabled}
          reacted={reacted}
          likeCount={likeCount}
          onClick={handleReactionClick}
        />
      );
    }
  }

  return null;
};

export default CommentReaction;
