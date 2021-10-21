import React from 'react';
import Tippy from '@tippyjs/react';
import styled, { keyframes } from 'styled-components';
import { colors, fontSizes, defaultStyles, isRtl } from 'utils/styleUtils';
import { lighten, darken } from 'polished';
import messages from './messages';
import { TVoteMode } from 'services/ideaVotes';
import { Icon, IconNames } from 'cl2-component-library';
import { isNilOrError, removeFocusAfterMouseClick } from 'utils/helperUtils';
import { FormattedMessage } from 'utils/cl-intl';
import { IdeaVotingDisabledReason } from 'services/ideas';
import { IProjectData } from 'services/projects';
import useAuthUser from 'hooks/useAuthUser';
import useIdea from 'hooks/useIdea';
import { FormattedDate } from 'react-intl';
import Link from 'utils/cl-router/Link';
import useLocalize from 'hooks/useLocalize';
import useProject from 'hooks/useProject';
import { IParticipationContextType } from 'typings';
import { openVerificationModal } from 'components/Verification/verificationModalEvents';

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
      border: solid 1px ${lighten(0.2, colors.label)};
      `
    );
  }}

  ${({
    disabledReason,
    buttonVoteModeIsActive,
    buttonVoteMode,
    votingEnabled,
  }) => {
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

    if (!votingEnabled) {
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

  ${({ buttonVoteModeIsActive, buttonVoteMode }) =>
    buttonVoteModeIsActive &&
    `
    border-color: ${{ up: colors.clGreen, down: colors.clRed }[buttonVoteMode]};
    background: ${{ up: colors.clGreen, down: colors.clRed }[buttonVoteMode]};`}

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
    const downvoteCondition =
      buttonVoteModeIsActive &&
      buttonVoteMode === 'down' &&
      disabledReason === 'downvoting_limited_max_reached';
    const upvoteCondition =
      buttonVoteModeIsActive &&
      buttonVoteMode === 'up' &&
      disabledReason === 'upvoting_limited_max_reached';

    if (votingEnabled || downvoteCondition || upvoteCondition) {
      if (size === '1') {
        return `
          width: 35px;
          height: 35px;
        `;
      }

      if (size === '2') {
        return `
          width: 45px;
          height: 45px;
        `;
      }

      if (size === '3') {
        return `
          width: 48px;
          height: 48px;
        `;
      }

      if (size === '4') {
        return `
          width: 50px;
          height: 50px;
        `;
      }
    }

    return `
      margin-left: 5px;
    `;
  }}
`;

const VoteCount = styled.div<{
  votingEnabled: boolean | null;
  buttonVoteMode: TVoteMode;
}>`
  color: ${colors.label};
  font-size: ${fontSizes.base}px;
  font-weight: 400;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin-left: 5px;
  transition: all 100ms ease-out;

  ${({ votingEnabled }) => {
    if (!votingEnabled) {
      return `
        margin-left: 3px;
      `;
    }

    return;
  }}

  ${({ buttonVoteMode, votingEnabled }) => {
    if (!votingEnabled && buttonVoteMode === 'up') {
      return isRtl`
        margin-right: 5px;
      `;
    }

    return;
  }}
`;

const VoteIcon = styled(Icon)<{
  size: TSize;
  votingEnabled: boolean | null;
  buttonVoteModeIsActive: boolean;
  buttonVoteMode: TVoteMode;
  disabledReason: IdeaVotingDisabledReason | null;
}>`
  width: 19px;
  height: 19px;
  fill: ${colors.label};
  transition: all 100ms ease-out;

  ${({ votingEnabled }) =>
    !votingEnabled &&
    `
     margin-right: 4px;
  `}

  ${(props) =>
    props.size === '1' &&
    `
      width: 17px;
      height: 17px;
    `}

  ${(props) =>
    props.size === '2' &&
    `
      width: 18px;
      height: 18px;
    `}

  ${(props) =>
    props.size === '3' &&
    `
      width: 20px;
      height: 20px;
    `}

  ${(props) =>
    props.size === '4' &&
    `
      width: 21px;
      height: 21px;
    `}

  ${({ buttonVoteMode }) => {
    return {
      up: 'margin-bottom: 4px;',
      down: 'margin-top: 3px;',
    }[buttonVoteMode];
  }}

  ${({
    buttonVoteModeIsActive,
    votingEnabled,
    buttonVoteMode: voteMode,
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
          fill: ${{ up: colors.clGreen, down: colors.clRed }[voteMode]};
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
          { up: colors.clGreen, down: colors.clRed }[voteMode]
        };`}
    }

    ${VoteIcon} {
      ${({ buttonVoteModeIsActive, buttonVoteMode: voteMode }) =>
        !buttonVoteModeIsActive &&
        `fill: ${{ up: colors.clGreen, down: colors.clRed }[voteMode]};`}
    }

    ${VoteCount} {
      ${({ buttonVoteModeIsActive, buttonVoteMode: voteMode }) => {
        return (
          !buttonVoteModeIsActive &&
          `color: ${{ up: colors.clGreen, down: colors.clRed }[voteMode]};`
        );
      }}
  }


  ${VoteCount} {
    ${({ buttonVoteModeIsActive, buttonVoteMode: voteMode }) =>
      buttonVoteModeIsActive &&
      `color: ${{ up: colors.clGreen, down: colors.clRed }[voteMode]};`}
    }
  }
`;

const StyledLink = styled(Link)`
  color: ${colors.clBlueDark};
  text-decoration: underline;

  &:hover {
    color: ${darken(0.15, colors.clBlueDark)};
    text-decoration: underline;
  }
`;

const StyledButton = styled.button`
  color: ${colors.clBlueDark};
  text-decoration: underline;
  transition: all 80ms ease-out;
  display: inline-block;
  margin: 0;
  padding: 0;
  cursor: pointer;

  &:hover {
    color: ${darken(0.15, colors.clBlueDark)};
    text-decoration: underline;
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
  setRef: (el: HTMLButtonElement) => void;
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
  setRef,
  iconName,
  ideaId,
  userVoteMode,
}: Props) => {
  const authUser = useAuthUser();
  const idea = useIdea({ ideaId });
  const projectId = !isNilOrError(idea)
    ? idea.relationships.project.data.id
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
    } else if (authUser && disabledReason === 'not_verified') {
      return messages.votingNotVerified;
    } else {
      return messages.votingNotEnabled;
    }
  };

  const stopPropagation = (event: React.MouseEvent | React.KeyboardEvent) => {
    event.stopPropagation();
  };

  const getProjectLink = (project: IProjectData) => {
    const projectTitle = project.attributes.title_multiloc;

    return (
      <StyledLink
        to={`/projects/${project.attributes.slug}`}
        onClick={stopPropagation}
      >
        {localize(projectTitle)}
      </StyledLink>
    );
  };

  const onVerify = (
    pcType: IParticipationContextType,
    // it's theoretically possible to have a timeline project
    // with no phases, in which case we would have no phase id
    pcId: string | undefined
  ) => (event: React.MouseEvent | React.KeyboardEvent) => {
    event.stopPropagation();
    event.preventDefault();
    if (pcId && pcType) {
      openVerificationModal({
        context: {
          action: 'voting_idea',
          id: pcId,
          type: pcType,
        },
      });
    }
  };

  if (!isNilOrError(idea) && !isNilOrError(project)) {
    const votingDescriptor = idea.attributes.action_descriptor.voting_idea;
    const buttonVoteModeEnabled = votingDescriptor[buttonVoteMode].enabled;
    const disabledReason =
      idea.attributes.action_descriptor.voting_idea[buttonVoteMode]
        .disabled_reason;
    const futureEnabled =
      idea.attributes.action_descriptor.voting_idea[buttonVoteMode]
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
    const projectName = getProjectLink(project);
    const pcType =
      project.attributes.process_type === 'continuous' ? 'project' : 'phase';
    const pcId =
      pcType === 'project'
        ? project.id
        : project.relationships?.current_phase?.data?.id;
    const verificationLink = (
      <StyledButton
        className="e2e-verify-button"
        onClick={onVerify(pcType, pcId)}
        onMouseDown={removeFocusAfterMouseClick}
      >
        <FormattedMessage {...messages.linkToVerificationText} />
      </StyledButton>
    );
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
              verificationLink,
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
          ref={setRef}
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
              size={size}
              votingEnabled={buttonEnabled}
              buttonVoteModeIsActive={buttonVoteModeIsActive}
              buttonVoteMode={buttonVoteMode}
              disabledReason={disabledReason}
              title={
                <FormattedMessage
                  {...{ up: messages.upvote, down: messages.downvote }[
                    buttonVoteMode
                  ]}
                />
              }
            />
          </VoteIconContainer>
          <VoteCount
            votingEnabled={buttonEnabled}
            buttonVoteMode={buttonVoteMode}
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
