import React, { MouseEvent, KeyboardEvent, useState } from 'react';
import { includes } from 'lodash-es';

import { isNilOrError } from 'utils/helperUtils';

// components
import ScreenReaderContent from './ScreenReaderContent';
import VoteButton from './VoteButton';

// services
import { IdeaVotingDisabledReason } from 'api/ideas/types';
import { getLatestRelevantPhase } from 'services/phases';

// utils
import { openSignUpInModal } from 'events/openSignUpInModal';
import { openVerificationModal } from 'events/verificationModal';

// style
import styled from 'styled-components';
import { isRtl } from 'utils/styleUtils';

// typings
import useIdeaById from 'api/ideas/useIdeaById';
import useAuthUser from 'hooks/useAuthUser';
import useProject from 'hooks/useProject';
import useIdeaVote from 'api/idea_votes/useIdeaVote';
import usePhases from 'hooks/usePhases';
import useAddIdeaVote from 'api/idea_votes/useAddIdeaVote';
import { TVoteMode } from 'api/idea_votes/types';
import useDeleteIdeaVote from 'api/idea_votes/useDeleteIdeaVote';

type TSize = '1' | '2' | '3' | '4';
type TStyleType = 'border' | 'shadow';

const Container = styled.div`
  display: flex;
  align-items: center;

  ${isRtl`
    flex-direction: row-reverse;
  `}

  * {
    user-select: none;
  }
`;

interface Props {
  ideaId: string;
  size: TSize;
  unauthenticatedVoteClick?: (voteMode: TVoteMode) => void;
  disabledVoteClick?: (disabled_reason?: IdeaVotingDisabledReason) => void;
  setRef?: (element: HTMLDivElement) => void;
  ariaHidden?: boolean;
  className?: string;
  styleType: TStyleType;
}

const VoteControl = ({
  ariaHidden = false,
  ideaId,
  size,
  className,
  styleType,
  disabledVoteClick,
}: Props) => {
  const [votingAnimation, setVotingAnimation] = useState<'up' | 'down' | null>(
    null
  );
  const { data: idea } = useIdeaById(ideaId);
  const { mutate: addVote, isLoading: addVoteIsLoading } = useAddIdeaVote();
  const { mutate: deleteVote, isLoading: deleteVoteIsLoading } =
    useDeleteIdeaVote();
  const authUser = useAuthUser();
  const project = useProject({
    projectId: idea?.data.relationships.project.data.id,
  });
  const phases = usePhases(idea?.data.relationships.project.data.id);
  const { data: voteData } = useIdeaVote(
    idea?.data.relationships.user_vote?.data?.id
  );

  const voteId = authUser && idea?.data?.relationships?.user_vote?.data?.id;

  if (!idea) return null;

  const ideaAttributes = idea.data.attributes;
  const votingActionDescriptor = ideaAttributes.action_descriptor.voting_idea;
  const votingEnabled = votingActionDescriptor.up.enabled;
  const votingDisabledReason = votingActionDescriptor.disabled_reason;
  const votingFutureEnabled = !!(
    votingActionDescriptor.up.future_enabled ||
    votingActionDescriptor.down.future_enabled
  );
  const cancellingEnabled = votingActionDescriptor.cancelling_enabled;

  // participationContext
  const ideaPhaseIds = idea?.data?.relationships?.phases?.data?.map(
    (item) => item.id
  );
  const ideaPhases =
    !isNilOrError(phases) &&
    phases
      ?.filter((phase) => includes(ideaPhaseIds, phase.id))
      .map((phase) => phase);
  const isContinuousProject = project?.attributes.process_type === 'continuous';
  const latestRelevantIdeaPhase = ideaPhases
    ? getLatestRelevantPhase(ideaPhases)
    : null;
  const participationContextType = isContinuousProject ? 'project' : 'phase';
  const participationContextId = isContinuousProject
    ? project?.id || null
    : latestRelevantIdeaPhase?.id || null;
  const participationContext = isContinuousProject
    ? project || null
    : latestRelevantIdeaPhase;
  const isPBContext =
    participationContext?.attributes.participation_method === 'budgeting';

  // Signed in
  const isSignedIn = !isNilOrError(authUser);
  const shouldSignIn =
    !votingEnabled &&
    (votingDisabledReason === 'not_signed_in' ||
      (votingDisabledReason === 'not_verified' && !isSignedIn));

  // Verification
  const shouldVerify =
    !votingEnabled && votingDisabledReason === 'not_verified' && isSignedIn;
  const verifiedButNotPermitted =
    !shouldVerify && votingDisabledReason === 'not_permitted';

  // Votes count
  const upvotesCount = ideaAttributes.upvotes_count;
  const downvotesCount = ideaAttributes.downvotes_count;

  const showVoteControl = !!(
    !isPBContext &&
    (votingEnabled ||
      shouldSignIn ||
      cancellingEnabled ||
      votingFutureEnabled ||
      upvotesCount > 0 ||
      downvotesCount > 0 ||
      shouldVerify ||
      verifiedButNotPermitted)
  );

  const myVoteMode = voteId ? voteData?.data.attributes.mode : null;

  const onClickUpvote = (event: MouseEvent | KeyboardEvent) => {
    event.preventDefault();
    event.stopPropagation();
    vote('up');
  };

  const onClickDownvote = (event: MouseEvent | KeyboardEvent) => {
    event.preventDefault();
    event.stopPropagation();
    vote('down');
  };

  const vote = async (voteMode: 'up' | 'down') => {
    setVotingAnimation(voteMode);
    const votingActionDescriptor =
      idea?.data.attributes.action_descriptor.voting_idea;
    const votingEnabled = {
      up: votingActionDescriptor?.up.enabled,
      down: votingActionDescriptor?.down.enabled,
    }[voteMode];
    const cancellingEnabled = votingActionDescriptor?.cancelling_enabled;
    const votingDisabledReason = {
      up: votingActionDescriptor?.up.disabled_reason,
      down: votingActionDescriptor?.down.disabled_reason,
    }[voteMode];

    const isSignedIn = !isNilOrError(authUser);
    const isTryingToUndoVote = !!(myVoteMode && voteMode === myVoteMode);
    const isVerified = !isNilOrError(authUser) && authUser.attributes.verified;

    if (!addVoteIsLoading && !deleteVoteIsLoading) {
      if (
        !isNilOrError(authUser) &&
        (votingEnabled || (cancellingEnabled && isTryingToUndoVote))
      ) {
        // Change vote (up -> down or down -> up)
        if (voteId && myVoteMode !== voteMode) {
          deleteVote(
            { ideaId, voteId },
            {
              onSuccess: () => {
                addVote(
                  { ideaId, userId: authUser.id, mode: voteMode },
                  {
                    onSuccess: () => {
                      setVotingAnimation(null);
                    },
                  }
                );
              },
            }
          );
        }

        // Cancel vote
        if (voteId && myVoteMode === voteMode) {
          deleteVote(
            { ideaId, voteId },
            {
              onSuccess: () => {
                setVotingAnimation(null);
              },
            }
          );
        }

        // Add vote
        if (!voteId) {
          addVote(
            { ideaId, userId: authUser.id, mode: voteMode },
            {
              onSuccess: () => {
                setVotingAnimation(null);
              },
            }
          );
        }
      } else if (
        isSignedIn &&
        !isVerified &&
        votingDisabledReason === 'not_verified'
      ) {
        openVerificationModal();
      } else if (
        !isSignedIn &&
        (votingEnabled ||
          votingDisabledReason === 'not_verified' ||
          votingDisabledReason === 'not_signed_in' ||
          votingDisabledReason === 'not_permitted')
      ) {
        openSignUpInModal({
          verification: votingDisabledReason === 'not_verified',
          verificationContext:
            votingDisabledReason === 'not_verified' &&
            participationContextId &&
            participationContextType
              ? {
                  action: 'voting_idea',
                  id: participationContextId,
                  type: participationContextType,
                }
              : undefined,
          action: () => vote(voteMode),
        });
      } else if (votingDisabledReason) {
        disabledVoteClick?.(votingDisabledReason);
      }
    }

    return;
  };

  if (idea && showVoteControl) {
    const votingDescriptor = idea.data.attributes.action_descriptor.voting_idea;
    // Only when downvoting is explicitly disabled,
    // we don't show the downvote button
    const showDownvote = votingDescriptor
      ? votingDescriptor.down.enabled === true ||
        (votingDescriptor.down.enabled === false &&
          votingDescriptor.down.disabled_reason !== 'downvoting_disabled')
      : true;

    return (
      <>
        <ScreenReaderContent
          upvotesCount={upvotesCount}
          downvotesCount={downvotesCount}
        />
        <Container
          className={[
            className,
            'e2e-vote-controls',
            myVoteMode === null ? 'neutral' : myVoteMode,
          ]
            .filter((item) => item)
            .join(' ')}
          aria-hidden={ariaHidden}
        >
          <VoteButton
            buttonVoteMode="up"
            userVoteMode={myVoteMode}
            onClick={onClickUpvote}
            className={votingAnimation === 'up' ? 'voteClick' : ''}
            ariaHidden={ariaHidden}
            styleType={styleType}
            size={size}
            iconName="vote-up"
            votesCount={upvotesCount}
            ideaId={idea.data.id}
          />

          {showDownvote && (
            <VoteButton
              buttonVoteMode="down"
              userVoteMode={myVoteMode}
              onClick={onClickDownvote}
              className={votingAnimation === 'down' ? 'voteClick' : ''}
              ariaHidden={ariaHidden}
              styleType={styleType}
              size={size}
              iconName="vote-down"
              votesCount={downvotesCount}
              ideaId={idea.data.id}
            />
          )}
        </Container>
      </>
    );
  }

  return null;
};

export default VoteControl;
