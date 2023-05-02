import React from 'react';
import Tippy from '@tippyjs/react';
import styled, { keyframes } from 'styled-components';
import { colors, fontSizes, defaultStyles, isRtl } from 'utils/styleUtils';
import { lighten } from 'polished';
import messages from './messages';
import { Icon, IconNames } from '@citizenlab/cl2-component-library';
import { isNilOrError, removeFocusAfterMouseClick } from 'utils/helperUtils';
import { FormattedMessage } from 'utils/cl-intl';
import { IdeaVotingDisabledReason } from 'api/ideas/types';
import useAuthUser from 'hooks/useAuthUser';
import useIdeaById from 'api/ideas/useIdeaById';
import { FormattedDate } from 'react-intl';
import useLocalize from 'hooks/useLocalize';
import useProject from 'hooks/useProject';
import { ScreenReaderOnly } from 'utils/a11y';
import { TVoteMode } from 'api/idea_votes/types';

type TSize = '1' | '2' | '3' | '4';
type TStyleType = 'border' | 'shadow';

const voteKeyframeAnimation = keyframes`
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

const VoteIconContainer = styled.div<{
  size: TSize;
  votingEnabled: boolean | null;
  styleType: TStyleType;
  buttonVoteModeIsActive: boolean;
  buttonVoteMode: TVoteMode;
  disabledReason: IdeaVotingDisabledReason | null;
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
    buttonVoteModeIsActive,
    buttonVoteMode,
    votingEnabled,
  }) => {
    if (!votingEnabled) {
      const downvoteCondition =
        (buttonVoteMode === 'down' &&
          disabledReason !== 'downvoting_limited_max_reached') ||
        (buttonVoteMode === 'down' &&
          disabledReason === 'downvoting_limited_max_reached' &&
          buttonVoteModeIsActive === false);
      const upvoteCondition =
        (buttonVoteMode === 'up' &&
          disabledReason !== 'upvoting_limited_max_reached') ||
        (buttonVoteMode === 'up' &&
          disabledReason === 'upvoting_limited_max_reached' &&
          buttonVoteModeIsActive === false);
      if (downvoteCondition || upvoteCondition) {
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
    buttonVoteModeIsActive,
    buttonVoteMode,
    votingEnabled,
    disabledReason,
  }) => {
    if (buttonVoteModeIsActive) {
      if (
        votingEnabled ||
        (!votingEnabled &&
          disabledReason === 'downvoting_limited_max_reached') ||
        (!votingEnabled && disabledReason === 'upvoting_limited_max_reached')
      ) {
        return `
            border-color: ${
              { up: colors.success, down: colors.error }[buttonVoteMode]
            };
            background: ${
              { up: colors.success, down: colors.error }[buttonVoteMode]
            };`;
      }
    }

    return;
  }}

  ${({ styleType, votingEnabled }) => {
    return (
      styleType === 'shadow' &&
      votingEnabled &&
      `
        box-shadow: ${defaultStyles.boxShadow};
        &:hover {
          box-shadow: ${defaultStyles.boxShadowHoverSmall};
        }
      `
    );
  }}

  ${({
    buttonVoteMode,
    votingEnabled,
    size,
    buttonVoteModeIsActive,
    disabledReason,
  }) => {
    const activeDownvoteButMaxReached =
      buttonVoteModeIsActive &&
      buttonVoteMode === 'down' &&
      disabledReason === 'downvoting_limited_max_reached';
    const activeUpvoteButMaxReached =
      buttonVoteModeIsActive &&
      buttonVoteMode === 'up' &&
      disabledReason === 'upvoting_limited_max_reached';

    if (
      votingEnabled ||
      activeDownvoteButMaxReached ||
      activeUpvoteButMaxReached
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

const VoteCount = styled.div<{
  votingEnabled: boolean | null;
  buttonVoteMode: TVoteMode;
  buttonVoteModeIsActive: boolean;
}>`
  color: ${colors.textSecondary};
  font-size: ${fontSizes.base}px;
  font-weight: 400;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin-left: 5px;
  transition: all 100ms ease-out;

  ${({ buttonVoteMode, votingEnabled }) => {
    if (!votingEnabled && buttonVoteMode === 'up') {
      return isRtl`
        margin-right: 5px;
      `;
    }

    return;
  }}

  ${({ buttonVoteModeIsActive, buttonVoteMode }) =>
    buttonVoteModeIsActive &&
    `color: ${{ up: colors.success, down: colors.error }[buttonVoteMode]};`}
    }
`;

const VoteIcon = styled(Icon)<{
  votingEnabled: boolean | null;
  buttonVoteModeIsActive: boolean;
  buttonVoteMode: TVoteMode;
  disabledReason: IdeaVotingDisabledReason | null;
}>`
  fill: ${colors.textSecondary};
  transition: all 100ms ease-out;
  width: 16px;
  height: 16px;

  ${({ votingEnabled, buttonVoteModeIsActive }) =>
    !votingEnabled &&
    !buttonVoteModeIsActive &&
    `
     margin-right: 4px;
  `}

  ${({
    buttonVoteModeIsActive,
    votingEnabled,
    buttonVoteMode,
    disabledReason,
  }) => {
    if (buttonVoteModeIsActive) {
      const downvoteCondition =
        !votingEnabled && disabledReason === 'downvoting_limited_max_reached';
      const upvoteCondition =
        !votingEnabled && disabledReason === 'upvoting_limited_max_reached';

      if (votingEnabled || downvoteCondition || upvoteCondition) {
        return `
          fill: #fff;
        `;
      }

      if (!votingEnabled) {
        return `
          fill: ${{ up: colors.success, down: colors.error }[buttonVoteMode]};
        `;
      }
    }

    return;
  }};
`;

const Button = styled.button<{
  buttonVoteModeIsActive: boolean;
  votingEnabled: boolean | null;
  buttonVoteMode: TVoteMode;
  disabledReason: IdeaVotingDisabledReason | null;
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

  &.voteClick ${VoteIconContainer} {
    animation: ${voteKeyframeAnimation} 350ms;
  }

  &:hover.enabled {
    ${VoteIconContainer} {
      ${({ buttonVoteModeIsActive, buttonVoteMode: voteMode }) =>
        !buttonVoteModeIsActive &&
        `border: 1px solid ${
          { up: colors.success, down: colors.error }[voteMode]
        };`}
    }

    ${VoteIcon} {
      ${({ buttonVoteModeIsActive, buttonVoteMode: voteMode }) =>
        !buttonVoteModeIsActive &&
        `fill: ${{ up: colors.success, down: colors.error }[voteMode]};`}
    }

    ${VoteCount} {
      ${({ buttonVoteModeIsActive, buttonVoteMode: voteMode }) => {
        return (
          !buttonVoteModeIsActive &&
          `color: ${{ up: colors.success, down: colors.error }[voteMode]};`
        );
      }}
  }
`;

interface Props {
  className?: string;
  userVoteMode: TVoteMode | null | undefined;
  buttonVoteMode: TVoteMode;
  votesCount: number;
  size: TSize;
  styleType: TStyleType;
  ariaHidden?: boolean;
  onClick: (event: React.FormEvent) => void;
  iconName: IconNames;
  ideaId: string;
}

const VoteButton = ({
  className,
  buttonVoteMode,
  votesCount,
  size,
  styleType,
  ariaHidden = false,
  onClick,
  iconName,
  ideaId,
  userVoteMode,
}: Props) => {
  const authUser = useAuthUser();
  const { data: idea } = useIdeaById(ideaId);
  const projectId = !isNilOrError(idea)
    ? idea.data.relationships.project.data.id
    : null;
  const project = useProject({ projectId });
  const localize = useLocalize();

  const getDisabledReasonMessage = (
    disabledReason: IdeaVotingDisabledReason | null,
    futureEnabled: string | null
  ) => {
    if (disabledReason === 'project_inactive') {
      return futureEnabled
        ? messages.votingPossibleLater
        : messages.votingDisabledProjectInactive;
    } else if (disabledReason === 'voting_disabled' && futureEnabled) {
      return messages.votingPossibleLater;
    } else if (disabledReason === 'upvoting_limited_max_reached') {
      return messages.upvotingDisabledMaxReached;
    } else if (disabledReason === 'downvoting_limited_max_reached') {
      return messages.downvotingDisabledMaxReached;
    } else if (disabledReason === 'idea_not_in_current_phase') {
      return futureEnabled
        ? messages.votingDisabledFutureEnabled
        : messages.votingDisabledPhaseOver;
    } else if (disabledReason === 'not_permitted') {
      return messages.votingNotPermitted;
    } else if (
      (authUser && disabledReason === 'not_active') ||
      disabledReason === 'missing_data'
    ) {
      return messages.completeProfileToVote;
    } else if (disabledReason === 'not_signed_in') {
      return messages.votingNotSignedIn;
    } else if (authUser && disabledReason === 'not_verified') {
      return messages.votingVerifyToVote;
    } else {
      return messages.votingNotEnabled;
    }
  };

  if (!isNilOrError(idea) && !isNilOrError(project)) {
    const votingDescriptor = idea.data.attributes.action_descriptor.voting_idea;
    const buttonVoteModeEnabled = votingDescriptor[buttonVoteMode].enabled;
    const disabledReason =
      idea.data.attributes.action_descriptor.voting_idea[buttonVoteMode]
        .disabled_reason;
    const futureEnabled =
      idea.data.attributes.action_descriptor.voting_idea[buttonVoteMode]
        .future_enabled;
    const cancellingEnabled = votingDescriptor.cancelling_enabled;
    const isSignedIn = !isNilOrError(authUser);
    const isVerified = !isNilOrError(authUser) && authUser.attributes.verified;
    const notYetVoted = userVoteMode !== buttonVoteMode;
    const alreadyVoted = userVoteMode === buttonVoteMode;
    const buttonEnabled =
      buttonVoteModeEnabled &&
      (notYetVoted ||
        (alreadyVoted && cancellingEnabled) ||
        (!isVerified && disabledReason === 'not_verified') ||
        (!isSignedIn && disabledReason === 'not_signed_in'));
    const disabledReasonMessage = getDisabledReasonMessage(
      disabledReason,
      futureEnabled
    );

    const enabledFromDate = futureEnabled ? (
      <FormattedDate
        value={futureEnabled}
        year="numeric"
        month="long"
        day="numeric"
      />
    ) : null;
    const projectName = localize(project.attributes.title_multiloc);
    const buttonVoteModeIsActive = buttonVoteMode === userVoteMode;

    return (
      <Tippy
        placement="top"
        theme="dark"
        disabled={disabledReason === null}
        content={
          <FormattedMessage
            {...disabledReasonMessage}
            values={{
              enabledFromDate,
              projectName,
            }}
          />
        }
        trigger="mouseenter"
      >
        <Button
          buttonVoteMode={buttonVoteMode}
          buttonVoteModeIsActive={buttonVoteModeIsActive}
          votingEnabled={buttonEnabled}
          onMouseDown={removeFocusAfterMouseClick}
          onClick={onClick}
          className={[
            className,
            {
              up: 'e2e-ideacard-upvote-button',
              down: 'e2e-ideacard-downvote-button',
            }[buttonVoteMode],
            buttonVoteModeEnabled ? 'enabled' : '',
          ].join(' ')}
          tabIndex={ariaHidden ? -1 : 0}
          disabledReason={disabledReason}
        >
          <VoteIconContainer
            styleType={styleType}
            size={size}
            votingEnabled={buttonEnabled}
            buttonVoteModeIsActive={buttonVoteModeIsActive}
            buttonVoteMode={buttonVoteMode}
            disabledReason={disabledReason}
          >
            <VoteIcon
              name={iconName}
              votingEnabled={buttonEnabled}
              buttonVoteModeIsActive={buttonVoteModeIsActive}
              buttonVoteMode={buttonVoteMode}
              disabledReason={disabledReason}
            />
            <ScreenReaderOnly>
              <FormattedMessage
                {...{ up: messages.upvote, down: messages.downvote }[
                  buttonVoteMode
                ]}
              />
            </ScreenReaderOnly>
          </VoteIconContainer>
          <VoteCount
            votingEnabled={buttonEnabled}
            buttonVoteMode={buttonVoteMode}
            buttonVoteModeIsActive={buttonVoteModeIsActive}
            aria-hidden
          >
            {votesCount}
          </VoteCount>
        </Button>
      </Tippy>
    );
  }

  return null;
};

export default VoteButton;
