import React, { MouseEvent, KeyboardEvent, useState, useCallback } from 'react';

// components
import ScreenReaderContent from './ScreenReaderContent';
import ReactionButton from './ReactionButton';

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
import useIdeaReaction from 'api/idea_reactions/useIdeaReaction';
import usePhases from 'api/phases/usePhases';
import useAddIdeaReaction from 'api/idea_reactions/useAddIdeaReaction';
import { TReactionMode } from 'api/idea_reactions/types';
import useDeleteIdeaReaction from 'api/idea_reactions/useDeleteIdeaReaction';
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
  ideaId?: string;
  size: TSize;
  unauthenticatedReactionClick?: (reactionMode: TReactionMode) => void;
  disabledReactionClick?: (
    disabled_reason?: IdeaReactingDisabledReason
  ) => void;
  setRef?: (element: HTMLDivElement) => void;
  ariaHidden?: boolean;
  className?: string;
  styleType: TStyleType;
}

const ReactionControl = ({
  ariaHidden = false,
  ideaId,
  size,
  className,
  styleType,
  disabledReactionClick,
}: Props) => {
  const [reactingAnimation, setReactingAnimation] = useState<
    'up' | 'down' | null
  >(null);
  const { data: idea } = useIdeaById(ideaId);
  const { mutate: addReaction, isLoading: addReactionIsLoading } =
    useAddIdeaReaction();
  const { mutate: deleteReaction, isLoading: deleteReactionIsLoading } =
    useDeleteIdeaReaction();
  const { data: authUser } = useAuthUser();
  const { data: project } = useProjectById(
    idea?.data.relationships.project.data.id
  );
  const { data: phases } = usePhases(idea?.data.relationships.project.data.id);
  const { data: reactionData } = useIdeaReaction(
    idea?.data.relationships.user_reaction?.data?.id
  );

  const reactionId =
    authUser && idea?.data?.relationships?.user_reaction?.data?.id;
  const myReactionMode = reactionId ? reactionData?.data.attributes.mode : null;

  const castReaction = useCallback(
    (reactionMode: 'up' | 'down') => {
      if (isNilOrError(authUser)) return;
      if (!ideaId) return;

      // Change reaction (up -> down or down -> up)
      if (reactionId && myReactionMode !== reactionMode) {
        deleteReaction(
          { ideaId, reactionId },
          {
            onSuccess: () => {
              addReaction(
                { ideaId, userId: authUser.data.id, mode: reactionMode },
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

      // Cancel reaction
      if (reactionId && myReactionMode === reactionMode) {
        deleteReaction(
          { ideaId, reactionId },
          {
            onSuccess: () => {
              setReactingAnimation(null);
            },
          }
        );
      }

      // Add reaction
      if (!reactionId) {
        addReaction(
          { ideaId, userId: authUser.data.id, mode: reactionMode },
          {
            onSuccess: () => {
              setReactingAnimation(null);
            },
          }
        );
      }
    },
    [authUser, addReaction, deleteReaction, ideaId, myReactionMode, reactionId]
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
  const isVotingContext =
    participationContext?.attributes.participation_method === 'voting';

  // Reactions count
  const likesCount = ideaAttributes.likes_count;
  const dislikesCount = ideaAttributes.dislikes_count;

  const showReactionControl = !!(
    !isVotingContext &&
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
    onReaction('up');
  };

  const onClickDislike = (event: MouseEvent | KeyboardEvent) => {
    event.preventDefault();
    event.stopPropagation();
    onReaction('down');
  };

  const onReaction = async (reactionMode: 'up' | 'down') => {
    if (!ideaId) return;
    setReactingAnimation(reactionMode);

    const {
      enabled: reactingEnabled,
      disabled_reason: reactingDisabledReason,
    } = reactingActionDescriptor[reactionMode];

    const isTryingToUndoReaction = !!(
      myReactionMode && reactionMode === myReactionMode
    );

    if (!participationContextId || !participationContextType) return;

    const context = {
      action: 'reacting_idea',
      id: participationContextId,
      type: participationContextType,
    } as const;

    const successAction: SuccessAction = {
      name: 'reactionOnIdea',
      params: {
        ideaId,
        reactionMode,
        myReactionMode,
      },
    };

    if (!addReactionIsLoading && !deleteReactionIsLoading) {
      if (
        !isNilOrError(authUser) &&
        (reactingEnabled || (cancellingEnabled && isTryingToUndoReaction))
      ) {
        castReaction(reactionMode);
      } else if (
        !reactingEnabled &&
        isFixableByAuthentication(reactingDisabledReason)
      ) {
        triggerAuthenticationFlow({ context, successAction });
      } else if (reactingDisabledReason) {
        disabledReactionClick?.(reactingDisabledReason);
      }
    }

    return;
  };

  if (idea && showReactionControl) {
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
            'e2e-reaction-controls',
            myReactionMode === null ? 'neutral' : myReactionMode,
          ]
            .filter((item) => item)
            .join(' ')}
          aria-hidden={ariaHidden}
        >
          <ReactionButton
            buttonReactionMode="up"
            userReactionMode={myReactionMode}
            onClick={onClickLike}
            className={reactingAnimation === 'up' ? 'reactionClick' : ''}
            ariaHidden={ariaHidden}
            styleType={styleType}
            size={size}
            iconName="vote-up"
            reactionsCount={likesCount}
            ideaId={idea.data.id}
          />

          {showDislike && (
            <ReactionButton
              buttonReactionMode="down"
              userReactionMode={myReactionMode}
              onClick={onClickDislike}
              className={reactingAnimation === 'down' ? 'reactionClick' : ''}
              ariaHidden={ariaHidden}
              styleType={styleType}
              size={size}
              iconName="vote-down"
              reactionsCount={dislikesCount}
              ideaId={idea.data.id}
            />
          )}
        </Container>
      </>
    );
  }

  return null;
};

export default ReactionControl;
