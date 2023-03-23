import React, { MouseEvent, useState, useEffect } from 'react';
import { adopt } from 'react-adopt';
import { get } from 'lodash-es';
import { isNilOrError } from 'utils/helperUtils';

// components
import UpvoteButton from './UpvoteButton';

// resources
import GetComment, { GetCommentChildProps } from 'resources/GetComment';
import GetCommentVote, {
  GetCommentVoteChildProps,
} from 'resources/GetCommentVote';

// events
import { openVerificationModal } from 'events/verificationModal';

// hooks
import useInitiativeById from 'api/initiatives/useInitiativeById';
import useIdeaById from 'api/ideas/useIdeaById';
import useAuthUser from 'hooks/useAuthUser';
import useInitiativesPermissions from 'hooks/useInitiativesPermissions';
import useOpenAuthModal from 'hooks/useOpenAuthModal';

// utils
import { upvote, removeVote } from './vote';

interface InputProps {
  postId: string;
  postType: 'idea' | 'initiative';
  commentId: string;
  commentType: 'parent' | 'child' | undefined;
  className?: string;
}

interface DataProps {
  comment: GetCommentChildProps;
  commentVote: GetCommentVoteChildProps;
}

interface Props extends InputProps, DataProps {}

const CommentVote = ({
  comment,
  commentVote,
  postId,
  postType,
  commentId,
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

  // Wondering why 'comment_voting_initiative' and not 'commenting_initiative'?
  // See app/api/initiative_action_descriptors/types.ts
  const commentVotingPermissionInitiative = useInitiativesPermissions(
    'comment_voting_initiative'
  );

  const vote = async () => {
    const oldVotedValue = voted;

    if (isNilOrError(authUser)) return;

    if (!oldVotedValue) {
      try {
        setVoted(true);
        setUpvoteCount((n) => n + 1);

        await upvote({
          postId,
          postType,
          commentId,
          userId: authUser.id,
          commentType,
        });
      } catch (error) {
        setVoted(false);
        setUpvoteCount((n) => n - 1);
      }
    }

    if (oldVotedValue && !isNilOrError(commentVote)) {
      try {
        setVoted(false);
        setUpvoteCount((n) => n - 1);

        await removeVote({
          commentId,
          commentVoteId: commentVote.id,
          commentType,
        });
      } catch (error) {
        setVoted(true);
        setUpvoteCount((n) => n + 1);
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

    if (postType === 'idea') {
      // Wondering why 'comment_voting_idea' and not 'commenting_idea'?
      // See /Users/work/Projects/citizenlab/front/app/api/ideas/types.ts
      const commentVotingDisabledReason = get(
        post,
        'attributes.action_descriptor.comment_voting_idea.disabled_reason'
      );

      const authUserIsVerified =
        !isNilOrError(authUser) && authUser.attributes.verified;

      // Wondering why 'commenting_idea' and not 'comment_voting_idea'?
      // See /Users/work/Projects/citizenlab/front/app/api/ideas/types.ts
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
    // See /Users/work/Projects/citizenlab/front/app/api/ideas/types.ts
    const commentingVotingIdeaDisabledReason = get(
      post,
      'attributes.action_descriptor.comment_voting_idea.disabled_reason'
    );

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

const Data = adopt<DataProps, InputProps>({
  comment: ({ commentId, render }) => (
    <GetComment id={commentId}>{render}</GetComment>
  ),
  commentVote: ({ comment, render }) => (
    <GetCommentVote
      voteId={
        !isNilOrError(comment)
          ? comment?.relationships?.user_vote?.data?.id
          : undefined
      }
    >
      {render}
    </GetCommentVote>
  ),
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps) => <CommentVote {...inputProps} {...dataProps} />}
  </Data>
);
