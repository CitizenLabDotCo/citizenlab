import React, { MouseEvent, KeyboardEvent, useState, useCallback } from 'react';

import { isRtl } from '@citizenlab/cl2-component-library';
import { includes } from 'lodash-es';
import styled from 'styled-components';

import { TReactionMode } from 'api/idea_reactions/types';
import useAddIdeaReaction from 'api/idea_reactions/useAddIdeaReaction';
import useDeleteIdeaReaction from 'api/idea_reactions/useDeleteIdeaReaction';
import useIdeaReaction from 'api/idea_reactions/useIdeaReaction';
import useIdeaById from 'api/ideas/useIdeaById';
import useAuthUser from 'api/me/useAuthUser';
import usePhases from 'api/phases/usePhases';
import { getLatestRelevantPhase } from 'api/phases/utils';

import { triggerAuthenticationFlow } from 'containers/Authentication/events';
import { SuccessAction } from 'containers/Authentication/SuccessActions/actions';

import { ScreenReaderOnly } from 'utils/a11y';
import { isFixableByAuthentication } from 'utils/actionDescriptors';
import { IdeaReactingDisabledReason } from 'utils/actionDescriptors/types';
import { useIntl } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';

import messages from './messages';
import ReactionButton from './ReactionButton';
import ScreenReaderContent from './ScreenReaderContent';

type TSize = '1' | '2' | '3' | '4';
type TStyleType = 'border' | 'shadow' | 'compact';

const Container = styled.div<{ reverse?: boolean }>`
  display: flex;
  align-items: center;
  flex-direction: ${({ reverse }) => (reverse ? 'row-reverse' : 'row')};

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
  variant?: 'text' | 'icon';
  disableTooltip?: boolean;
}

const ReactionControl = ({
  ideaId,
  size,
  className,
  styleType,
  unauthenticatedReactionClick,
  disabledReactionClick,
  variant = 'icon',
}: Props) => {
  const [reactingAnimation, setReactingAnimation] = useState<
    'up' | 'down' | null
  >(null);
  const { formatMessage } = useIntl();
  const [screenReaderMessage, setScreenReaderMessage] = useState<string>('');
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
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    authUser && idea?.data?.relationships?.user_reaction?.data?.id;
  const myReactionMode = reactionId ? reactionData?.data.attributes.mode : null;

  const setScreenReaderCancelReactionMessage = useCallback(
    (reactionMode: TReactionMode) => {
      const messageKey =
        reactionMode === 'up'
          ? messages.cancelLikeSuccess
          : messages.cancelDislikeSuccess;
      setScreenReaderMessage(formatMessage(messageKey));
    },
    [formatMessage]
  );

  const setScreenReaderReactionSuccessMessage = useCallback(
    (reactionMode: TReactionMode) => {
      const messageKey =
        reactionMode === 'up' ? messages.likeSuccess : messages.dislikeSuccess;
      setScreenReaderMessage(formatMessage(messageKey));
    },
    [formatMessage]
  );

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
                    setScreenReaderReactionSuccessMessage(reactionMode);
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
              setScreenReaderCancelReactionMessage(reactionMode);
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
              setScreenReaderReactionSuccessMessage(reactionMode);
            },
          }
        );
      }
    },
    [
      authUser,
      ideaId,
      reactionId,
      myReactionMode,
      deleteReaction,
      addReaction,
      setScreenReaderReactionSuccessMessage,
      setScreenReaderCancelReactionMessage,
    ]
  );

  if (!idea) return null;

  const ideaAttributes = idea.data.attributes;
  const reactingActionDescriptor =
    ideaAttributes.action_descriptors.reacting_idea;
  const cancellingEnabled = reactingActionDescriptor.cancelling_enabled;

  // participationContext
  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  const ideaPhaseIds = idea?.data?.relationships?.phases?.data?.map(
    (item) => item.id
  );
  const ideaPhases =
    phases &&
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
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
        unauthenticatedReactionClick?.(reactionMode);
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
    reactingActionDescriptor.down.enabled === true || // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
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
        reverse={styleType === 'compact'}
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
          variant={variant}
        />
        {variant === 'icon' && showDislike && (
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
        <ScreenReaderOnly aria-live="polite">
          {screenReaderMessage}
        </ScreenReaderOnly>
      </Container>
    </>
  );
};

export default ReactionControl;
