import React, { MouseEvent, KeyboardEvent, useState, useCallback } from 'react';

// components
import ScreenReaderContent from './ScreenReaderContent';
import VoteButton from './VoteButton';

// services
import { IdeaVotingDisabledReason } from 'api/ideas/types';
import { getLatestRelevantPhase } from 'api/phases/utils';

// events
import { triggerAuthenticationFlow } from 'containers/Authentication/events';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { includes } from 'lodash-es';

// style
import styled from 'styled-components';
import { isRtl } from 'utils/styleUtils';

// typings
import useIdeaById from 'api/ideas/useIdeaById';
import useAuthUser from 'hooks/useAuthUser';
import useProjectById from 'api/projects/useProjectById';
import useIdeaVote from 'api/idea_votes/useIdeaVote';
import usePhases from 'api/phases/usePhases';
import useAddIdeaVote from 'api/idea_votes/useAddIdeaVote';
import { TVoteMode } from 'api/idea_votes/types';
import useDeleteIdeaVote from 'api/idea_votes/useDeleteIdeaVote';
import { SuccessAction } from 'containers/Authentication/SuccessActions/actions';
import { isFixableByAuthentication } from 'utils/actionDescriptors';

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
  const { data: project } = useProjectById(
    idea?.data.relationships.project.data.id
  );
  const { data: phases } = usePhases(idea?.data.relationships.project.data.id);
  const { data: voteData } = useIdeaVote(
    idea?.data.relationships.user_vote?.data?.id
  );

  const voteId = authUser && idea?.data?.relationships?.user_vote?.data?.id;
  const myVoteMode = voteId ? voteData?.data.attributes.mode : null;

  const castVote = useCallback(
    (voteMode: 'up' | 'down') => {
      if (isNilOrError(authUser)) return;

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
    },
    [authUser, addVote, deleteVote, ideaId, myVoteMode, voteId]
  );

  if (!idea) return null;

  const ideaAttributes = idea.data.attributes;
  const votingActionDescriptor = ideaAttributes.action_descriptor.voting_idea;
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
    phases &&
    phases?.data
      .filter((phase) => includes(ideaPhaseIds, phase.id))
      .map((phase) => phase);
  const isContinuousProject =
    project?.data.attributes.process_type === 'continuous';
  const latestRelevantIdeaPhase = ideaPhases
    ? getLatestRelevantPhase(ideaPhases)
    : null;
  const participationContextType = isContinuousProject ? 'project' : 'phase';
  const participationContextId = isContinuousProject
    ? project?.data.id || null
    : latestRelevantIdeaPhase?.id || null;
  const participationContext = isContinuousProject
    ? project.data || null
    : latestRelevantIdeaPhase;
  const isPBContext =
    participationContext?.attributes.participation_method === 'budgeting';

  // Votes count
  const upvotesCount = ideaAttributes.upvotes_count;
  const downvotesCount = ideaAttributes.downvotes_count;

  const showVoteControl = !!(
    !isPBContext &&
    (votingActionDescriptor.enabled ||
      isFixableByAuthentication(votingActionDescriptor.disabled_reason) ||
      cancellingEnabled ||
      votingFutureEnabled ||
      upvotesCount > 0 ||
      downvotesCount > 0)
  );

  const onClickUpvote = (event: MouseEvent | KeyboardEvent) => {
    event.preventDefault();
    event.stopPropagation();
    onVote('up');
  };

  const onClickDownvote = (event: MouseEvent | KeyboardEvent) => {
    event.preventDefault();
    event.stopPropagation();
    onVote('down');
  };

  const onVote = async (voteMode: 'up' | 'down') => {
    setVotingAnimation(voteMode);

    const { enabled: votingEnabled, disabled_reason: votingDisabledReason } =
      votingActionDescriptor[voteMode];

    const isTryingToUndoVote = !!(myVoteMode && voteMode === myVoteMode);

    if (!participationContextId || !participationContextType) return;

    const context = {
      action: 'voting_idea',
      id: participationContextId,
      type: participationContextType,
    } as const;

    const successAction: SuccessAction = {
      name: 'voteOnIdea',
      params: {
        ideaId,
        voteMode,
        myVoteMode,
      },
    };

    if (!addVoteIsLoading && !deleteVoteIsLoading) {
      if (
        !isNilOrError(authUser) &&
        (votingEnabled || (cancellingEnabled && isTryingToUndoVote))
      ) {
        castVote(voteMode);
      } else if (
        !votingEnabled &&
        isFixableByAuthentication(votingDisabledReason)
      ) {
        triggerAuthenticationFlow({ context, successAction });
      } else if (votingDisabledReason) {
        disabledVoteClick?.(votingDisabledReason);
      }
    }

    return;
  };

  if (idea && showVoteControl) {
    // Only when downvoting is explicitly disabled,
    // we don't show the downvote button
    const showDownvote =
      votingActionDescriptor.down.enabled === true ||
      (votingActionDescriptor.down.enabled === false &&
        votingActionDescriptor.down.disabled_reason !== 'downvoting_disabled');

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
