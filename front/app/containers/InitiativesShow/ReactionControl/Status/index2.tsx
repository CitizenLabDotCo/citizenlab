import React from 'react';
import styled from 'styled-components';
import { Box, Icon, IconNames } from '@citizenlab/cl2-component-library';
import { StatusWrapper, StatusExplanation } from '../SharedStyles';
import T from 'components/T';
import { StatusComponentProps } from '.';
import ReadAnswerButton from './components/ReadAnswerButton';
import VoteButtons from './components/VoteButtons';
import ReactionCounter from './components/ReactionCounter';

const StatusIcon = styled(Icon)`
  path {
    fill: ${(props) => props.theme.colors.tenantText};
  }
  width: 30px;
  height: 30px;
  margin-bottom: 20px;
`;

interface Props extends StatusComponentProps {
  iconName: IconNames;
  statusExplanation: React.ReactNode;
  barColor?: string;
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
      <Box mb="8px">
        <VoteButtons
          onCancelReaction={onCancelReaction}
          onReaction={onReaction}
          userReacted={userReacted}
        />
      </Box>
      {showReadAnswerButton && (
        <ReadAnswerButton onClick={onScrollToOfficialFeedback} />
      )}
    </>
  );
};

export default Status;
