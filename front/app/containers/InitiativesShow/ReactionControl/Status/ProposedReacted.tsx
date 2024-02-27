import React from 'react';
import styled, { keyframes } from 'styled-components';
import { colors, Icon, Box, Text } from '@citizenlab/cl2-component-library';
import { getPeriodRemainingUntil } from 'utils/dateUtils';
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';
import { StatusComponentProps } from '.';
import CountDown from '../CountDown';
import VoteButtons from './components/VoteButtons';
import ReactionCounter from './components/ReactionCounter';

const Container = styled.div`
  display: flex;
  flex-direction: column;
`;

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

const StyledIcon = styled(Icon)`
  animation: ${scaleIn} 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
`;

const ProposedReacted = ({
  initiative,
  initiativeSettings,
  onCancelReaction,
  onReaction,
  userReacted,
}: StatusComponentProps) => {
  const daysLeft = getPeriodRemainingUntil(initiative.attributes.expires_at);

  return (
    <Container>
      <Box ml="auto">
        <CountDown targetTime={initiative.attributes.expires_at} />
      </Box>
      <Box mb="8px">
        <StyledIcon
          fill={colors.success}
          width="31px"
          height="31px"
          ariaHidden
          name="check-circle"
        />
      </Box>
      <Text m="0">
        <b>
          <FormattedMessage {...messages.votedTitle} />
        </b>{' '}
        <FormattedMessage
          {...messages.votedText}
          values={{
            x: daysLeft,
            xDays: (
              <b>
                <FormattedMessage
                  {...messages.xDays}
                  values={{ x: daysLeft }}
                />
              </b>
            ),
          }}
        />
      </Text>
      <Box mb="24px">
        <ReactionCounter
          initiative={initiative}
          initiativeSettings={initiativeSettings}
        />
      </Box>
      <VoteButtons
        cancelVoteButtonId="e2e-initiative-cancel-like-button"
        onCancelReaction={onCancelReaction}
        onReaction={onReaction}
        userReacted={userReacted}
      />
    </Container>
  );
};

export default ProposedReacted;
