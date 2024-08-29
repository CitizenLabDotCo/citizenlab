import React from 'react';

import {
  Box,
  Icon,
  IconNames,
  colors,
  fontSizes,
} from '@citizenlab/cl2-component-library';
import styled, { keyframes } from 'styled-components';

import T from 'components/T';

import { ScreenReaderOnly } from 'utils/a11y';
import { FormattedMessage } from 'utils/cl-intl';

import messages from '../messages';
import { StatusComponentProps } from '../StatusWrapper';

import CountDown from './components/CountDown';
import ReactionCounter from './components/ReactionCounter';
import ReadAnswerButton from './components/ReadAnswerButton';
import VoteButtons from './components/VoteButtons';

const scaleIn = keyframes`
  0% {
    transform: scale(0);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
`;

export const StatusHeading = styled.h2`
  display: flex;
  font-size: ${fontSizes.base}px;
  font-weight: bold;
  text-transform: capitalize;
`;

export const StatusExplanation = styled.div`
  font-size: ${fontSizes.base}px;
  color: ${(props) => props.theme.colors.tenantText};
  line-height: 23px;

  .tooltip-icon {
    margin-left: 3px;
    display: inline-block;
  }

  b {
    font-weight: 600;
    background-color: rgba(255, 197, 47, 0.16);
  }
`;

const StatusIcon = styled(Icon)`
  path {
    fill: ${(props) => props.theme.colors.tenantText};
  }
  width: 30px;
  height: 30px;
  animation: ${scaleIn} 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
`;

interface Props extends StatusComponentProps {
  iconName: IconNames;
  statusExplanation: React.ReactNode;
  barColor?: string;
  showCountDown: boolean;
  showProgressBar: boolean;
  showVoteButtons: boolean;
  showReadAnswerButton: boolean;
  cancelReactionDisabled?: boolean;
}

const Status = ({
  onReaction,
  onCancelReaction,
  onScrollToOfficialFeedback,
  initiative,
  initiativeStatus,
  initiativeSettings,
  userReacted,
  iconName,
  statusExplanation,
  barColor,
  showCountDown,
  showProgressBar,
  showVoteButtons,
  showReadAnswerButton,
  cancelReactionDisabled = false,
  disabledReason,
}: Props) => {
  return (
    <Box display="flex" flexDirection="column">
      {showCountDown && (
        <Box ml="auto" mb="24px">
          <ScreenReaderOnly>
            <FormattedMessage {...messages.a11y_timeLeft} />
          </ScreenReaderOnly>
          <CountDown targetTime={initiative.attributes.expires_at} />
        </Box>
      )}
      <Box display="flex" mb="16px" alignItems="center">
        <StatusIcon mr="8px" name={iconName} />
        <StatusHeading>
          <T value={initiativeStatus.attributes.title_multiloc} />
        </StatusHeading>
      </Box>
      <Box mb="24px" aria-live="polite">
        <StatusExplanation>{statusExplanation}</StatusExplanation>
      </Box>
      {showProgressBar && (
        <Box mb="24px">
          <ReactionCounter
            initiative={initiative}
            initiativeSettings={initiativeSettings}
            barColor={barColor || colors.success}
          />
        </Box>
      )}
      {showVoteButtons && (
        <Box mb="8px">
          <VoteButtons
            onCancelReaction={onCancelReaction}
            onReaction={onReaction}
            userReacted={userReacted}
            cancelReactionDisabled={cancelReactionDisabled}
            disabledReason={disabledReason}
          />
        </Box>
      )}
      {showReadAnswerButton && (
        <Box mb="8px">
          <ReadAnswerButton onClick={onScrollToOfficialFeedback} />
        </Box>
      )}
    </Box>
  );
};

export default Status;
