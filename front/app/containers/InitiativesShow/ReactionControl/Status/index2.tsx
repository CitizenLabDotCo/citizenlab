import React from 'react';
import styled, { keyframes } from 'styled-components';
import { Box, Icon, IconNames } from '@citizenlab/cl2-component-library';
import { StatusWrapper, StatusExplanation } from '../SharedStyles';
import T from 'components/T';
import { StatusComponentProps } from '.';
import ReadAnswerButton from './components/ReadAnswerButton';
import VoteButtons from './components/VoteButtons';
import ReactionCounter from './components/ReactionCounter';

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
  margin-bottom: 20px;
  animation: ${scaleIn} 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
`;

interface Props extends StatusComponentProps {
  iconName: IconNames;
  statusExplanation: React.ReactNode;
  barColor?: string;
  showVoteButtons?: boolean;
  cancelReactionDisabled?: boolean;
  showReadAnswerButton?: boolean;
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
  cancelReactionDisabled = false,
  showVoteButtons = false,
  showReadAnswerButton = false,
}: Props) => {
  return (
    <>
      <Box mb="16px">
        <StatusWrapper>
          <T value={initiativeStatus.attributes.title_multiloc} />
        </StatusWrapper>
      </Box>
      <StatusIcon name={iconName} />
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
          />
        </Box>
      )}
      {showReadAnswerButton && (
        <ReadAnswerButton onClick={onScrollToOfficialFeedback} />
      )}
    </>
  );
};

export default Status;
