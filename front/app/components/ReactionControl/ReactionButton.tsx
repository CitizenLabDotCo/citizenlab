import React from 'react';

import {
  colors,
  fontSizes,
  defaultStyles,
  isRtl,
  Icon,
  IconNames,
  Tooltip,
  Button as ButtonComponent,
  Box,
} from '@citizenlab/cl2-component-library';
import { lighten } from 'polished';
import { FormattedDate } from 'react-intl';
import styled, { keyframes } from 'styled-components';

import { TReactionMode } from 'api/idea_reactions/types';
import useIdeaById from 'api/ideas/useIdeaById';
import useProjectById from 'api/projects/useProjectById';

import useLocalize from 'hooks/useLocalize';

import { ScreenReaderOnly } from 'utils/a11y';
import {
  getPermissionsDisabledMessage,
  isFixableByAuthentication,
} from 'utils/actionDescriptors';
import { IdeaReactingDisabledReason } from 'utils/actionDescriptors/types';
import { FormattedMessage } from 'utils/cl-intl';
import { isNilOrError, removeFocusAfterMouseClick } from 'utils/helperUtils';

import messages from './messages';

type TSize = '1' | '2' | '3' | '4';
type TStyleType = 'border' | 'shadow';

const reactionKeyframeAnimation = keyframes`
  from {
    transform: scale3d(1, 1, 1);
  }

  40% {
    transform: scale3d(1.25, 1.25, 1.25);
  }

  to {
    transform: scale3d(1, 1, 1);
  }
`;

const ReactionIconContainer = styled.div<{
  size: TSize;
  reactingEnabled: boolean | null;
  styleType: TStyleType;
  buttonReactionModeIsActive: boolean;
  buttonReactionMode: TReactionMode;
  disabledReason: IdeaReactingDisabledReason | null;
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1px;
  border-radius: 50%;
  transition: all 60ms ease-out;
  background-color: white;

  ${({ styleType }) => {
    return (
      styleType === 'border' &&
      `
      padding: 8px;
      border: solid 1px ${lighten(0.2, colors.textSecondary)};
      `
    );
  }}

  ${({
    disabledReason,
    buttonReactionModeIsActive,
    buttonReactionMode,
    reactingEnabled,
  }) => {
    if (!reactingEnabled) {
      const dislikeCondition =
        (buttonReactionMode === 'down' &&
          disabledReason !== 'reacting_dislike_limited_max_reached') ||
        (buttonReactionMode === 'down' &&
          disabledReason === 'reacting_dislike_limited_max_reached' &&
          buttonReactionModeIsActive === false);
      const likeCondition =
        (buttonReactionMode === 'up' &&
          disabledReason !== 'reacting_like_limited_max_reached') ||
        (buttonReactionMode === 'up' &&
          disabledReason === 'reacting_like_limited_max_reached' &&
          buttonReactionModeIsActive === false);
      if (dislikeCondition || likeCondition) {
        return `
          width: auto;
          border: none;
          background: none;
        `;
      }
    }

    return;
  }}

  ${({
    buttonReactionModeIsActive,
    buttonReactionMode,
    reactingEnabled,
    disabledReason,
  }) => {
    if (buttonReactionModeIsActive) {
      if (
        reactingEnabled || // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        (!reactingEnabled &&
          disabledReason === 'reacting_dislike_limited_max_reached') || // TODO: Fix this the next time the file is edited.
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        (!reactingEnabled &&
          disabledReason === 'reacting_like_limited_max_reached')
      ) {
        return `
            border-color: ${
              { up: colors.success, down: colors.error }[buttonReactionMode]
            };
            background: ${
              { up: colors.success, down: colors.error }[buttonReactionMode]
            };`;
      }
    }

    return;
  }}

  ${({ styleType, reactingEnabled }) => {
    return (
      styleType === 'shadow' &&
      reactingEnabled &&
      `
        box-shadow: ${defaultStyles.boxShadow};
        &:hover {
          box-shadow: ${defaultStyles.boxShadowHoverSmall};
        }
      `
    );
  }}

  ${({
    buttonReactionMode,
    reactingEnabled,
    size,
    buttonReactionModeIsActive,
    disabledReason,
  }) => {
    const activeDislikeButMaxReached =
      buttonReactionModeIsActive &&
      buttonReactionMode === 'down' &&
      disabledReason === 'reacting_dislike_limited_max_reached';
    const activeLikeButMaxReached =
      buttonReactionModeIsActive &&
      buttonReactionMode === 'up' &&
      disabledReason === 'reacting_like_limited_max_reached';

    if (
      reactingEnabled ||
      activeDislikeButMaxReached ||
      activeLikeButMaxReached
    ) {
      return {
        1: `
          width: 35px;
          height: 35px;
        `,
        2: `
          width: 45px;
          height: 45px;
        `,
        3: `
          width: 48px;
          height: 48px;
        `,
        4: `
          width: 50px;
          height: 50px;
        `,
      }[size];
    }

    return `
      margin-left: 5px;
    `;
  }}
`;

const ReactionCount = styled.div<{
  reactingEnabled: boolean | null;
  buttonReactionMode: TReactionMode;
  buttonReactionModeIsActive: boolean;
}>`
  color: ${colors.textSecondary};
  font-size: ${fontSizes.base}px;
  font-weight: 400;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin-left: 5px;
  transition: all 100ms ease-out;

  ${({ buttonReactionMode, reactingEnabled }) => {
    if (!reactingEnabled && buttonReactionMode === 'up') {
      return isRtl`
        margin-right: 5px;
      `;
    }

    return;
  }}

  ${({ buttonReactionModeIsActive, buttonReactionMode }) =>
    buttonReactionModeIsActive &&
    `color: ${{ up: colors.success, down: colors.error }[buttonReactionMode]};`}
    }
`;

const ReactionIcon = styled(Icon)<{
  reactingEnabled: boolean | null;
  buttonReactionModeIsActive: boolean;
  buttonReactionMode: TReactionMode;
  disabledReason: IdeaReactingDisabledReason | null;
}>`
  fill: ${colors.textSecondary};
  transition: all 100ms ease-out;
  width: 16px;
  height: 16px;

  ${({ reactingEnabled, buttonReactionModeIsActive }) =>
    !reactingEnabled &&
    !buttonReactionModeIsActive &&
    `
     margin-right: 4px;
  `}

  ${({
    buttonReactionModeIsActive,
    reactingEnabled,
    buttonReactionMode,
    disabledReason,
  }) => {
    if (buttonReactionModeIsActive) {
      const dislikeCondition =
        !reactingEnabled &&
        disabledReason === 'reacting_dislike_limited_max_reached';
      const likeCondition =
        !reactingEnabled &&
        disabledReason === 'reacting_like_limited_max_reached';

      if (reactingEnabled || dislikeCondition || likeCondition) {
        return `
          fill: #fff;
        `;
      }

      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (!reactingEnabled) {
        return `
          fill: ${
            { up: colors.success, down: colors.error }[buttonReactionMode]
          };
        `;
      }
    }

    return;
  }};
`;

const Button = styled.button<{
  buttonReactionModeIsActive: boolean;
  reactingEnabled: boolean | null;
  buttonReactionMode: TReactionMode;
}>`
  display: flex;
  align-items: center;
  padding: 0;
  margin: 0;
  cursor: pointer;
  border: none;
  margin-right: 15px;

  ${isRtl`
    flex-direction: row-reverse;
  `}

  &.reactionClick ${ReactionIconContainer} {
    animation: ${reactionKeyframeAnimation} 350ms;
  }

  &:hover.enabled {
    ${ReactionIconContainer} {
      ${({ buttonReactionModeIsActive, buttonReactionMode: reactionMode }) =>
        !buttonReactionModeIsActive &&
        `border: 1px solid ${
          { up: colors.success, down: colors.error }[reactionMode]
        };`}
    }

    ${ReactionIcon} {
      ${({ buttonReactionModeIsActive, buttonReactionMode: reactionMode }) =>
        !buttonReactionModeIsActive &&
        `fill: ${{ up: colors.success, down: colors.error }[reactionMode]};`}
    }

    ${ReactionCount} {
      ${({ buttonReactionModeIsActive, buttonReactionMode: reactionMode }) => {
        return (
          !buttonReactionModeIsActive &&
          `color: ${{ up: colors.success, down: colors.error }[reactionMode]};`
        );
      }}
  }
`;

interface Props {
  className?: string;
  userReactionMode: TReactionMode | null | undefined;
  buttonReactionMode: TReactionMode;
  reactionsCount: number;
  size: TSize;
  styleType: TStyleType;
  onClick: (event: React.FormEvent) => void;
  iconName: IconNames;
  ideaId: string;
  variant?: 'text' | 'icon';
}

const ReactionButton = ({
  className,
  buttonReactionMode,
  reactionsCount,
  size,
  styleType,
  onClick,
  iconName,
  ideaId,
  userReactionMode,
  variant = 'icon',
}: Props) => {
  const { data: idea } = useIdeaById(ideaId);
  const projectId = !isNilOrError(idea)
    ? idea.data.relationships.project.data.id
    : null;

  const { data: project } = useProjectById(projectId);
  const localize = useLocalize();

  if (!isNilOrError(idea) && !isNilOrError(project)) {
    const reactingDescriptor =
      idea.data.attributes.action_descriptors.reacting_idea;
    const buttonReactionModeEnabled =
      reactingDescriptor[buttonReactionMode].enabled;
    const disabledReason =
      idea.data.attributes.action_descriptors.reacting_idea[buttonReactionMode]
        .disabled_reason;
    const futureEnabledAt =
      idea.data.attributes.action_descriptors.reacting_idea[buttonReactionMode]
        .future_enabled_at;
    const cancellingEnabled = reactingDescriptor.cancelling_enabled;
    const notYetReacted = userReactionMode !== buttonReactionMode;
    const alreadyReacted = userReactionMode === buttonReactionMode;
    const buttonEnabled =
      buttonReactionModeEnabled &&
      (notYetReacted ||
        (alreadyReacted && cancellingEnabled) ||
        (disabledReason && isFixableByAuthentication(disabledReason)));

    const disabledOrFutureEnabledReason =
      futureEnabledAt &&
      disabledReason &&
      [
        'project_inactive',
        'reacting_disabled',
        'idea_not_in_current_phase',
      ].includes(disabledReason)
        ? 'future_enabled'
        : disabledReason;

    const disabledReasonMessage = getPermissionsDisabledMessage(
      'reacting_idea',
      disabledOrFutureEnabledReason
    );

    const enabledFromDate = futureEnabledAt ? (
      <FormattedDate
        value={futureEnabledAt}
        year="numeric"
        month="long"
        day="numeric"
      />
    ) : null;
    const projectName = localize(project.data.attributes.title_multiloc);
    const buttonReactionModeIsActive = buttonReactionMode === userReactionMode;

    const describedById = disabledReason
      ? `describedbyid-${ideaId}`
      : undefined;

    const disabledMessage = disabledReasonMessage && (
      <FormattedMessage
        {...disabledReasonMessage}
        values={{
          enabledFromDate,
          projectName,
        }}
      />
    );

    return (
      <Tooltip
        placement="top"
        theme="dark"
        disabled={disabledReason === null}
        content={
          <span
            // aria-hidden is needed because we already use ScreenReaderOnly for screen readers
            // and we don't want to duplicate the message
            aria-hidden
          >
            {disabledMessage}
          </span>
        }
        trigger="mouseenter"
        width={variant === 'text' ? '100%' : 'fit-content'}
      >
        <Box>
          {variant === 'text' && (
            <ButtonComponent
              onClick={onClick}
              icon={buttonReactionModeIsActive ? 'check' : 'vote-ballot'}
              bgColor={buttonReactionModeIsActive ? colors.success : undefined}
              className="e2e-ideacard-vote-button"
              aria-describedby={describedById}
            >
              {buttonReactionModeIsActive ? (
                <FormattedMessage {...messages.voted} />
              ) : (
                <FormattedMessage {...messages.vote} />
              )}
              <ScreenReaderOnly>
                <FormattedMessage
                  {...{ up: messages.like, down: messages.dislike }[
                    buttonReactionMode
                  ]}
                />
              </ScreenReaderOnly>
            </ButtonComponent>
          )}
          {variant === 'icon' && (
            <Button
              buttonReactionMode={buttonReactionMode}
              buttonReactionModeIsActive={buttonReactionModeIsActive}
              reactingEnabled={buttonEnabled}
              onMouseDown={removeFocusAfterMouseClick}
              onClick={onClick}
              className={[
                className,
                {
                  up: 'e2e-ideacard-like-button',
                  down: 'e2e-ideacard-dislike-button',
                }[buttonReactionMode],
                buttonReactionModeEnabled ? 'enabled' : '',
              ].join(' ')}
              aria-describedby={describedById}
            >
              <ReactionIconContainer
                styleType={styleType}
                size={size}
                reactingEnabled={buttonEnabled}
                buttonReactionModeIsActive={buttonReactionModeIsActive}
                buttonReactionMode={buttonReactionMode}
                disabledReason={disabledReason}
              >
                <ReactionIcon
                  name={iconName}
                  reactingEnabled={buttonEnabled}
                  buttonReactionModeIsActive={buttonReactionModeIsActive}
                  buttonReactionMode={buttonReactionMode}
                  disabledReason={disabledReason}
                />
                <ScreenReaderOnly>
                  <FormattedMessage
                    {...{ up: messages.like, down: messages.dislike }[
                      buttonReactionMode
                    ]}
                  />
                </ScreenReaderOnly>
              </ReactionIconContainer>
              <ReactionCount
                reactingEnabled={buttonEnabled}
                buttonReactionMode={buttonReactionMode}
                buttonReactionModeIsActive={buttonReactionModeIsActive}
                aria-hidden
              >
                {reactionsCount}
              </ReactionCount>
            </Button>
          )}
          {describedById && disabledMessage && (
            <ScreenReaderOnly id={describedById}>
              {`. `}
              {disabledMessage}
            </ScreenReaderOnly>
          )}
        </Box>
      </Tooltip>
    );
  }

  return null;
};

export default ReactionButton;
