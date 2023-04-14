import React, { MouseEvent, useState, useEffect } from 'react';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';

// components
import UpvoteButton from './UpvoteButton';

// resources
import GetComment, { GetCommentChildProps } from 'resources/GetComment';
import GetCommentVote, {
  GetCommentVoteChildProps,
} from 'resources/GetCommentVote';

// events
import { triggerAuthenticationFlow } from 'containers/NewAuthModal/events';

// hooks
import useInitiativeById from 'api/initiatives/useInitiativeById';
import useIdeaById from 'api/ideas/useIdeaById';
import useAuthUser from 'hooks/useAuthUser';
import useInitiativesPermissions from 'hooks/useInitiativesPermissions';

// utils
import { upvote, removeVote } from './vote';
import { postIsIdea, postIsInitiative } from '../utils';

// typings
import { SuccessAction } from 'containers/NewAuthModal/SuccessActions/actions';
import { isFixableByAuthentication } from 'utils/actionDescriptors';

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
      setVoted(true);
      setUpvoteCount((n) => n + 1);

      try {
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
      setVoted(false);
      setUpvoteCount((n) => n - 1);

      try {
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
        postId,
        postType,
        commentId,
        commentVoteId: isNilOrError(commentVote) ? undefined : commentVote.id,
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
