import React from 'react';
import Tippy from '@tippyjs/react';
import styled, { css, keyframes } from 'styled-components';
import { colors, fontSizes, defaultStyles, isRtl } from 'utils/styleUtils';
import { lighten } from 'polished';
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
import { darken } from 'polished';
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
      css`
        border: solid 1px ${lighten(0.2, colors.label)};
      `
    );
  }}


  ${({ styleType, votingEnabled }) => {
    return (
      styleType === 'shadow' &&
      votingEnabled &&
      css`
        box-shadow: ${defaultStyles.boxShadow};
        &:hover {
          box-shadow: ${defaultStyles.boxShadowHoverSmall};
        }
      `
    );
  }}

  ${({ votingEnabled, size }) => {
    if (votingEnabled) {
      if (size === '1') {
        return css`
          width: 35px;
          height: 35px;
        `;
      }

      if (size === '2') {
        return css`
          width: 45px;
          height: 45px;
        `;
      }

      if (size === '3') {
        return css`
          width: 48px;
          height: 48px;
        `;
      }

      if (size === '4') {
        return css`
          width: 50px;
          height: 50px;
        `;
      }
    }

    return css`
      margin-left: 5px;
    `;
  }}
`;

const VoteCount = styled.div`
  color: ${colors.label};
  font-size: ${fontSizes.base}px;
  font-weight: 400;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin-left: 5px;
  transition: all 100ms ease-out;

  &:not(.enabled) {
    margin-left: 3px;
  }
`;

const VoteIcon = styled(Icon)<{
  size: TSize;
  enabled: boolean | null;
}>`
  width: 19px;
  height: 19px;
  fill: ${colors.label};
  transition: all 100ms ease-out;

  ${(props) =>
    props.size === '1'
      ? css`
          width: 17px;
          height: 17px;
        `
      : css``}

  ${(props) =>
    props.size === '2'
      ? css`
          width: 18px;
          height: 18px;
        `
      : css``}

  ${(props) =>
    props.size === '3'
      ? css`
          width: 20px;
          height: 20px;
        `
      : css``}

  ${(props) =>
    props.size === '4'
      ? css`
          width: 21px;
          height: 21px;
        `
      : css``}
`;

const Button = styled.button<{
  active: boolean;
  votingEnabled: boolean | null;
  voteMode: TVoteMode;
}>`
  display: flex;
  align-items: center;
  padding: 0;
  margin: 0;
  cursor: pointer;
  border: none;

  ${({ voteMode }) => voteMode === 'up' && 'margin-right: 8px;'}

  ${isRtl`
    flex-direction: row-reverse;
  `}

  &.voteClick ${VoteIconContainer} {
    animation: ${css`
      ${voteKeyframeAnimation} 350ms
    `};
  }

  &:hover.enabled {
    ${VoteIconContainer} {
      ${({ active, voteMode }) =>
        !active &&
        `border: 1px solid ${
          { up: colors.clGreen, down: colors.clRed }[voteMode]
        };`}
    }

    ${VoteIcon} {
      ${({ active, voteMode }) =>
        !active &&
        `fill: ${{ up: colors.clGreen, down: colors.clRed }[voteMode]};`}
    }

    ${VoteCount} {
      ${({ active, voteMode }) =>
        !active &&
        `color: ${{ up: colors.clGreen, down: colors.clRed }[voteMode]};`}
    }
  }

  &:not(.enabled) {
    ${VoteIconContainer} {
      width: auto;
      border: none;
      background: none;
    }

    ${VoteIcon} {
      margin-right: 4px;
    }

    ${VoteCount} {
      ${({ voteMode }) =>
        voteMode === 'up' &&
        isRtl`
        margin-right: 5px;
      `}
    }
  }

  ${VoteIconContainer} {
    ${({ active, voteMode }) =>
      active &&
      `
      border-color: ${{ up: colors.clGreen, down: colors.clRed }[voteMode]};
      background: ${{ up: colors.clGreen, down: colors.clRed }[voteMode]};`}
  }

  ${VoteIcon} {
    ${({ voteMode }) => {
      return {
        up: 'margin-bottom: 4px;',
        down: 'margin-top: 4px;',
      }[voteMode];
    }}

    ${({ active, votingEnabled, voteMode }) => {
      if (active && votingEnabled) {
        return css`
          fill: #fff;
        `;
      }

      if (active && !votingEnabled) {
        return css`
          fill: ${{ up: colors.clGreen, down: colors.clRed }[voteMode]};
        `;
      }

      return;
    }};
  }

  ${VoteCount} {
    ${({ active, voteMode }) =>
      active &&
      `color: ${{ up: colors.clGreen, down: colors.clRed }[voteMode]};`}
    }

    ${({ voteMode }) =>
      voteMode === 'up' &&
      `
        min-width: 20px;
        margin-right: 5px;
      `}
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
  active: boolean;
  voteMode: TVoteMode;
  votesCount: number;
  size: TSize;
  styleType: TStyleType;
  ariaHidden?: boolean;
  votingEnabled: boolean;
  onClick: (event: React.FormEvent) => void;
  setRef: (el: HTMLButtonElement) => void;
  iconName: IconNames;
  ideaId: string;
}

const VoteButton = ({
  className,
  active,
  voteMode,
  votesCount,
  size,
  styleType,
  ariaHidden = false,
  votingEnabled,
  onClick,
  setRef,
  iconName,
  ideaId,
}: Props) => {
  const authUser = useAuthUser();
  const idea = useIdea({ ideaId });
  const projectId = !isNilOrError(idea)
    ? idea.relationships.project.data.id
    : null;
  const project = projectId ? useProject({ projectId }) : null;
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
    } else if (disabledReason === 'voting_limited_max_reached') {
      return messages.votingDisabledMaxReached;
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
    const disabledReason =
      idea.attributes.action_descriptor.voting_idea[voteMode].disabled_reason;
    const futureEnabled =
      idea.attributes.action_descriptor.voting_idea[voteMode].future_enabled;
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

    return (
      <Tippy
        placement="top"
        theme="light"
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
          voteMode={voteMode}
          active={active}
          votingEnabled={votingEnabled}
          onMouseDown={removeFocusAfterMouseClick}
          onClick={onClick}
          ref={setRef}
          className={className}
          tabIndex={ariaHidden ? -1 : 0}
        >
          <VoteIconContainer
            styleType={styleType}
            size={size}
            votingEnabled={votingEnabled}
          >
            <VoteIcon
              name={iconName}
              size={size}
              enabled={votingEnabled}
              title={
                <FormattedMessage
                  {...{ up: messages.upvote, down: messages.downvote }[
                    voteMode
                  ]}
                />
              }
            />
          </VoteIconContainer>
          <VoteCount
            aria-hidden
            className={[votingEnabled ? 'enabled' : ''].join(' ')}
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
