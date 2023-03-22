import React, { MouseEvent, useState, useEffect } from 'react';
import { adopt } from 'react-adopt';
import { get } from 'lodash-es';
import { isNilOrError } from 'utils/helperUtils';

// components
import UpvoteButton from './UpvoteButton';

// services
import { addCommentVote, deleteCommentVote } from 'services/commentVotes';

// resources
import GetAuthUser, { GetAuthUserChildProps } from 'resources/GetAuthUser';
import GetComment, { GetCommentChildProps } from 'resources/GetComment';
import GetCommentVote, {
  GetCommentVoteChildProps,
} from 'resources/GetCommentVote';
import GetInitiativesPermissions, {
  GetInitiativesPermissionsChildProps,
} from 'resources/GetInitiativesPermissions';

// analytics
import { trackEventByName } from 'utils/analytics';
import tracks from '../../tracks';

// events
import { openSignUpInModal } from 'events/openSignUpInModal';
import { openVerificationModal } from 'events/verificationModal';

// hooks
import useInitiativeById from 'api/initiatives/useInitiativeById';
import useIdeaById from 'api/ideas/useIdeaById';

interface InputProps {
  postId: string;
  postType: 'idea' | 'initiative';
  commentId: string;
  commentType: 'parent' | 'child' | undefined;
  className?: string;
}

interface DataProps {
  commentVotingPermissionInitiative: GetInitiativesPermissionsChildProps;
  authUser: GetAuthUserChildProps;
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
  authUser,
  commentVotingPermissionInitiative,
  className,
}: Props) => {
  const [voted, setVoted] = useState(false);
  const [upvoteCount, setUpvoteCount] = useState(0);
  const initiativeId = postType === 'initiative' ? postId : undefined;
  const ideaId = postType === 'idea' ? postId : undefined;
  const { data: initiative } = useInitiativeById(initiativeId);
  const { data: idea } = useIdeaById(ideaId);

  const post = postType === 'idea' ? idea?.data : initiative?.data;

  useEffect(() => {
    setVoted(!isNilOrError(commentVote));
    setUpvoteCount(
      !isNilOrError(comment) ? comment.attributes.upvotes_count : 0
    );
  }, [commentVote, comment]);

  useEffect(() => {
    if (!isNilOrError(comment)) {
      const upvoteCount = comment.attributes.upvotes_count;
      setUpvoteCount(upvoteCount);
    }

    if (!voted && !isNilOrError(commentVote)) {
      setVoted(true);
    }

    if (voted && isNilOrError(commentVote)) {
      setVoted(false);
    }
  }, [comment, commentVote, voted]);

  const vote = async () => {
    const oldVotedValue = voted;
    const oldUpvoteCount = upvoteCount;
    if (!isNilOrError(authUser)) {
      if (!oldVotedValue) {
        try {
          setVoted(true);
          setUpvoteCount(upvoteCount + 1);

          await addCommentVote(postId, postType, commentId, {
            user_id: authUser.id,
            mode: 'up',
          });

          if (commentType === 'parent') {
            trackEventByName(tracks.clickParentCommentUpvoteButton);
          } else if (commentType === 'child') {
            trackEventByName(tracks.clickChildCommentUpvoteButton);
          } else {
            trackEventByName(tracks.clickCommentUpvoteButton);
          }
        } catch (error) {
          setVoted(oldVotedValue);
          setUpvoteCount(oldUpvoteCount);
        }
      }

      if (
        oldVotedValue &&
        !isNilOrError(comment) &&
        !isNilOrError(commentVote)
      ) {
        try {
          setVoted(false);
          setUpvoteCount(upvoteCount - 1);
          await deleteCommentVote(comment.id, commentVote.id);

          if (commentType === 'parent') {
            trackEventByName(tracks.clickParentCommentCancelUpvoteButton);
          } else if (commentType === 'child') {
            trackEventByName(tracks.clickChildCommentCancelUpvoteButton);
          } else {
            trackEventByName(tracks.clickCommentCancelUpvoteButton);
          }
        } catch (error) {
          setVoted(oldVotedValue);
          setUpvoteCount(oldUpvoteCount);
        }
      }
    }
  };

  const handleVoteClick = async (event?: MouseEvent) => {
    event?.preventDefault();

    if (postType === 'idea') {
      const commentVotingDisabledReason = get(
        post,
        'attributes.action_descriptor.commenting_idea.disabled_reason'
      );

      const authUserIsVerified =
        !isNilOrError(authUser) && authUser.attributes.verified;

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
      } else if (!authUser) {
        openSignUpInModal({
          verification: commentVotingDisabledReason === 'not_verified',
          context,
          onSuccess: () => vote(),
        });
      } else if (commentVotingDisabledReason === 'not_active') {
        openSignUpInModal({ context });
      }
    }

    if (postType === 'initiative') {
      const authenticationRequirements =
        commentVotingPermissionInitiative?.authenticationRequirements;
      const context = {
        action: 'commenting_initiative',
        type: 'initiative',
      } as const;

      if (authenticationRequirements === 'sign_in_up') {
        openSignUpInModal({
          context,
          onSuccess: () => vote(),
        });
      } else if (authenticationRequirements === 'complete_registration') {
        openSignUpInModal({
          context,
          onSuccess: () => vote(),
        });
      } else if (authenticationRequirements === 'sign_in_up_and_verify') {
        openSignUpInModal({
          verification: true,
          context,
          onSuccess: () => vote(),
        });
      } else if (authenticationRequirements === 'verify') {
        openVerificationModal({ context });
      } else if (commentVotingPermissionInitiative?.enabled === true) {
        vote();
      }
    }
  };

  if (!isNilOrError(comment)) {
    const commentingVotingDisabledReason = get(
      post,
      'attributes.action_descriptor.commenting_idea.disabled_reason'
    );
    const isSignedIn = !isNilOrError(authUser);
    const disabled =
      postType === 'initiative'
        ? !commentVotingPermissionInitiative?.enabled
        : isSignedIn && commentingVotingDisabledReason === 'not_permitted';

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
  authUser: <GetAuthUser />,
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
  commentVotingPermissionInitiative: (
    <GetInitiativesPermissions action="comment_voting_initiative" />
  ),
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps) => <CommentVote {...inputProps} {...dataProps} />}
  </Data>
);
