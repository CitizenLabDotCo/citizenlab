import React from 'react';
import styled, { keyframes } from 'styled-components';
import { Box, Icon, IconNames } from '@citizenlab/cl2-component-library';
import { StatusWrapper, StatusExplanation } from '../SharedStyles';
import T from 'components/T';
import { StatusComponentProps } from '../StatusWrapper';
import ReadAnswerButton from './components/ReadAnswerButton';
import VoteButtons from './components/VoteButtons';
import ReactionCounter from './components/ReactionCounter';
import CountDown from '../CountDown';

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
  showVoteButtons,
  showReadAnswerButton,
  cancelReactionDisabled = false,
  disabledReason,
}: Props) => {
  return (
    <Box display="flex" flexDirection="column">
      {showCountDown && (
        <Box ml="auto" mb="24px">
          {/* Still add (hidden) heading */}
          <CountDown targetTime={initiative.attributes.expires_at} />
        </Box>
      )}
      <Box display="flex" mb="16px" alignItems="center">
        <StatusIcon mr="8px" name={iconName} />
        <StatusWrapper>
          <T value={initiativeStatus.attributes.title_multiloc} />
        </StatusWrapper>
      </Box>
      <Box mb="24px">
        <StatusExplanation>{statusExplanation}</StatusExplanation>
      </Box>
      <Box mb="24px">
        <ReactionCounter
          initiative={initiative}
          initiativeSettings={initiativeSettings}
          barColor={barColor}
        />
      </Box>
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
