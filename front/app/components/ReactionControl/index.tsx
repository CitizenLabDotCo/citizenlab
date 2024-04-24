import React, { MouseEvent, KeyboardEvent, useState, useCallback } from 'react';

import { isRtl } from '@citizenlab/cl2-component-library';
import { includes } from 'lodash-es';
import styled from 'styled-components';

import { TReactionMode } from 'api/idea_reactions/types';
import useAddIdeaReaction from 'api/idea_reactions/useAddIdeaReaction';
import useDeleteIdeaReaction from 'api/idea_reactions/useDeleteIdeaReaction';
import useIdeaReaction from 'api/idea_reactions/useIdeaReaction';
import { IdeaReactingDisabledReason } from 'api/ideas/types';
import useIdeaById from 'api/ideas/useIdeaById';
import useAuthUser from 'api/me/useAuthUser';
import usePhases from 'api/phases/usePhases';
import { getLatestRelevantPhase } from 'api/phases/utils';

import { triggerAuthenticationFlow } from 'containers/Authentication/events';
import { SuccessAction } from 'containers/Authentication/SuccessActions/actions';

import { isFixableByAuthentication } from 'utils/actionDescriptors';
import { isNilOrError } from 'utils/helperUtils';

import ReactionButton from './ReactionButton';
import ScreenReaderContent from './ScreenReaderContent';

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
  className?: string;
  styleType: TStyleType;
}

const ReactionControl = ({
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
  const latestRelevantIdeaPhase = ideaPhases
    ? getLatestRelevantPhase(ideaPhases)
    : null;
  const phaseId = latestRelevantIdeaPhase?.id || null;

  // Reactions count
  const likesCount = ideaAttributes.likes_count;
  const dislikesCount = ideaAttributes.dislikes_count;

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

    if (!phaseId) return;

    const context = {
      action: 'reacting_idea',
      id: phaseId,
      type: 'phase',
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

  // Only when disliking is explicitly disabled,
  // we don't show the dislike button
  const showDislike =
    reactingActionDescriptor.down.enabled === true ||
    (reactingActionDescriptor.down.enabled === false &&
      reactingActionDescriptor.down.disabled_reason !==
        'reacting_dislike_disabled');

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
      >
        <ReactionButton
          buttonReactionMode="up"
          userReactionMode={myReactionMode}
          onClick={onClickLike}
          className={reactingAnimation === 'up' ? 'reactionClick' : ''}
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
};

export default ReactionControl;
