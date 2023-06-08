import React, { MouseEvent, KeyboardEvent, useState, useCallback } from 'react';

// components
import ScreenReaderContent from './ScreenReaderContent';
import VoteButton from './VoteButton';

// services
import { IdeaReactingDisabledReason } from 'api/ideas/types';
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
import useAuthUser from 'api/me/useAuthUser';
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
  disabledVoteClick?: (disabled_reason?: IdeaReactingDisabledReason) => void;
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
  const [reactingAnimation, setReactingAnimation] = useState<
    'up' | 'down' | null
  >(null);
  const { data: idea } = useIdeaById(ideaId);
  const { mutate: addVote, isLoading: addVoteIsLoading } = useAddIdeaVote();
  const { mutate: deleteVote, isLoading: deleteVoteIsLoading } =
    useDeleteIdeaVote();
  const { data: authUser } = useAuthUser();
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
                { ideaId, userId: authUser.data.id, mode: voteMode },
                {
                  onSuccess: () => {
                    setReactingAnimation(null);
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
              setReactingAnimation(null);
            },
          }
        );
      }

      // Add vote
      if (!voteId) {
        addVote(
          { ideaId, userId: authUser.data.id, mode: voteMode },
          {
            onSuccess: () => {
              setReactingAnimation(null);
            },
          }
        );
      }
    },
    [authUser, addVote, deleteVote, ideaId, myVoteMode, voteId]
  );

  if (!idea) return null;

  const ideaAttributes = idea.data.attributes;
  const reactingActionDescriptor =
    ideaAttributes.action_descriptor.reacting_idea;
  const reactingFutureEnabled = !!(
    reactingActionDescriptor.up.future_enabled ||
    reactingActionDescriptor.down.future_enabled
  );
  const cancellingEnabled = reactingActionDescriptor.cancelling_enabled;

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
  const likesCount = ideaAttributes.likes_count;
  const dislikesCount = ideaAttributes.dislikes_count;

  const showVoteControl = !!(
    !isPBContext &&
    (reactingActionDescriptor.enabled ||
      isFixableByAuthentication(reactingActionDescriptor.disabled_reason) ||
      cancellingEnabled ||
      reactingFutureEnabled ||
      likesCount > 0 ||
      dislikesCount > 0)
  );

  const onClickLike = (event: MouseEvent | KeyboardEvent) => {
    event.preventDefault();
    event.stopPropagation();
    onVote('up');
  };

  const onClickDislike = (event: MouseEvent | KeyboardEvent) => {
    event.preventDefault();
    event.stopPropagation();
    onVote('down');
  };

  const onVote = async (voteMode: 'up' | 'down') => {
    setReactingAnimation(voteMode);

    const {
      enabled: reactingEnabled,
      disabled_reason: reactingDisabledReason,
    } = reactingActionDescriptor[voteMode];

    const isTryingToUndoVote = !!(myVoteMode && voteMode === myVoteMode);

    if (!participationContextId || !participationContextType) return;

    const context = {
      action: 'reacting_idea',
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
        (reactingEnabled || (cancellingEnabled && isTryingToUndoVote))
      ) {
        castVote(voteMode);
      } else if (
        !reactingEnabled &&
        isFixableByAuthentication(reactingDisabledReason)
      ) {
        triggerAuthenticationFlow({ context, successAction });
      } else if (reactingDisabledReason) {
        disabledVoteClick?.(reactingDisabledReason);
      }
    }

    return;
  };

  if (idea && showVoteControl) {
    // Only when disliking is explicitly disabled,
    // we don't show the dislike button
    const showDislike =
      reactingActionDescriptor.down.enabled === true ||
      (reactingActionDescriptor.down.enabled === false &&
        reactingActionDescriptor.down.disabled_reason !== 'disliking_disabled');

    return (
      <>
        <ScreenReaderContent
          likesCount={likesCount}
          dislikesCount={dislikesCount}
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
            onClick={onClickLike}
            className={reactingAnimation === 'up' ? 'voteClick' : ''}
            ariaHidden={ariaHidden}
            styleType={styleType}
            size={size}
            iconName="vote-up"
            votesCount={likesCount}
            ideaId={idea.data.id}
          />

          {showDislike && (
            <VoteButton
              buttonVoteMode="down"
              userVoteMode={myVoteMode}
              onClick={onClickDislike}
              className={reactingAnimation === 'down' ? 'voteClick' : ''}
              ariaHidden={ariaHidden}
              styleType={styleType}
              size={size}
              iconName="vote-down"
              votesCount={dislikesCount}
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
