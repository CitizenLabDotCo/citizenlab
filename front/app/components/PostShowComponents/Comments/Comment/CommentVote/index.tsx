import React, { MouseEvent, useState, useEffect } from 'react';
import { isNilOrError } from 'utils/helperUtils';

// components
import UpvoteButton from './UpvoteButton';

// events
import { openVerificationModal } from 'events/verificationModal';

// hooks
import useInitiativeById from 'api/initiatives/useInitiativeById';
import useIdeaById from 'api/ideas/useIdeaById';
import useAuthUser from 'hooks/useAuthUser';
import useInitiativesPermissions from 'hooks/useInitiativesPermissions';
import useOpenAuthModal from 'hooks/useOpenAuthModal';
import useDeleteCommentVote from 'api/comment_votes/useDeleteCommentVote';
import useAddCommentVote from 'api/comment_votes/useAddCommentVote';
import useCommentVote from 'api/comment_votes/useCommentVote';

// tracks
import tracks from '../../tracks';
import { trackEventByName } from 'utils/analytics';

// typings
import { ICommentData } from 'services/comments';
import { IInitiativeData } from 'api/initiatives/types';
import { IIdeaData } from 'api/ideas/types';

interface Props {
  postId: string;
  postType: 'idea' | 'initiative';
  commentType: 'parent' | 'child' | undefined;
  comment: ICommentData;
  className?: string;
}

const postIsIdea = (post: IIdeaData | IInitiativeData): post is IIdeaData => {
  return post.type === 'idea';
};

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

  const openAuthModal = useOpenAuthModal({
    onSuccess: vote,
    waitIf: isNilOrError(authUser),
  });

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

    if (post && postIsIdea(post)) {
      // Wondering why 'comment_voting_idea' and not 'commenting_idea'?
      // See app/api/ideas/types.ts
      const commentVotingDisabledReason =
        post.attributes.action_descriptor.comment_voting_idea.disabled_reason;

      const authUserIsVerified =
        !isNilOrError(authUser) && authUser.attributes.verified;

      // Wondering why 'commenting_idea' and not 'comment_voting_idea'?
      // See app/api/ideas/types.ts
      const context = {
        type: 'idea',
        action: 'commenting_idea',
        id: postId,
      } as const;

      if (!isNilOrError(authUser) && !commentVotingDisabledReason) {
        vote();
      } else if (
        !isNilOrError(authUser) &&
        !authUserIsVerified &&
        commentVotingDisabledReason === 'not_verified'
      ) {
        openVerificationModal({ context });
      } else if (authUser === null) {
        openAuthModal({
          verification: commentVotingDisabledReason === 'not_verified',
          context,
        });
      } else if (commentVotingDisabledReason === 'not_active') {
        openAuthModal({ context });
      }
    }

    if (postType === 'initiative') {
      const authenticationRequirements =
        commentVotingPermissionInitiative?.authenticationRequirements;

      // Wondering why 'commenting_initiative' and not 'comment_voting_initiative'?
      // See app/api/initiative_action_descriptors/types.ts
      const context = {
        action: 'commenting_initiative',
        type: 'initiative',
      } as const;

      if (authenticationRequirements === 'sign_in_up') {
        openAuthModal({ context });
      } else if (authenticationRequirements === 'complete_registration') {
        openAuthModal({ context });
      } else if (authenticationRequirements === 'sign_in_up_and_verify') {
        openAuthModal({ verification: true, context });
      } else if (authenticationRequirements === 'verify') {
        openVerificationModal({ context });
      } else if (commentVotingPermissionInitiative?.enabled === true) {
        vote();
      }
    }
  };

  if (!isNilOrError(comment)) {
    // Wondering why 'comment_voting_idea' and not 'commenting_idea'?
    // See app/api/ideas/types.ts
    const commentingVotingIdeaDisabledReason =
      post?.attributes && 'action_descriptor' in post.attributes
        ? post?.attributes.action_descriptor.comment_voting_idea.disabled_reason
        : undefined;

    const isSignedIn = !isNilOrError(authUser);
    const disabled =
      postType === 'initiative'
        ? !commentVotingPermissionInitiative?.enabled
        : isSignedIn && commentingVotingIdeaDisabledReason === 'not_permitted';

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
