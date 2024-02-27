import React from 'react';
import styled from 'styled-components';
import { Box, Icon, colors } from '@citizenlab/cl2-component-library';

import { StatusWrapper, StatusExplanation } from '../SharedStyles';

import T from 'components/T';
import messages from '../messages';
import { FormattedMessage } from 'utils/cl-intl';
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

const Answered = ({
  onReaction,
  onCancelReaction,
  onScrollToOfficialFeedback,
  initiative,
  initiativeStatus,
  initiativeSettings,
  userReacted,
}: StatusComponentProps) => {
  return (
    <Box>
      <Box mb="16px">
        <StatusWrapper>
          <T value={initiativeStatus.attributes.title_multiloc} />
        </StatusWrapper>
      </Box>
      <StatusIcon name="email-check" />
      <Box mb="24px">
        <StatusExplanation>
          <FormattedMessage
            {...messages.answeredStatusExplanation}
            values={{
              answeredStatusExplanationBold: (
                <b>
                  <FormattedMessage
                    {...messages.answeredStatusExplanationBold}
                  />
                </b>
              ),
            }}
          />
        </StatusExplanation>
      </Box>
      <Box mb="24px">
        <ReactionCounter
          initiative={initiative}
          initiativeSettings={initiativeSettings}
          barColor={colors.green500}
        />
      </Box>
      <Box mb="8px">
        <VoteButtons
          onCancelReaction={onCancelReaction}
          onReaction={onReaction}
          userReacted={userReacted}
        />
      </Box>
      <ReadAnswerButton onClick={onScrollToOfficialFeedback} />
    </Box>
  );
};

export default Answered;
