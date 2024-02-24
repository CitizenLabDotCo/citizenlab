import React from 'react';
import styled, { useTheme } from 'styled-components';
import {
  Box,
  Icon,
  IconTooltip,
  colors,
} from '@citizenlab/cl2-component-library';

// components
import { StatusWrapper, StatusExplanation } from '../SharedStyles';

// i18n
import T from 'components/T';
import messages from '../messages';
import { FormattedMessage } from 'utils/cl-intl';

// Types
import { StatusComponentProps } from '.';
import VoteButtons from './components/VoteButtons';
import ReactionCounter from './components/ReactionCounter';

const Container = styled.div``;

const StatusIcon = styled(Icon)`
  path {
    fill: ${(props) => props.theme.colors.tenantText};
  }
  width: 30px;
  height: 30px;
  margin-bottom: 20px;
`;

const ThresholdReached = ({
  initiative,
  initiativeSettings,
  initiativeStatus,
  userReacted,
  onReaction,
}: StatusComponentProps) => {
  const theme = useTheme();

  return (
    <Container>
      <Box mb="16px">
        <StatusWrapper>
          <T value={initiativeStatus.attributes.title_multiloc} />
        </StatusWrapper>
      </Box>
      <StatusIcon ariaHidden name="email-check" />
      <Box mb="24px">
        <StatusExplanation>
          <FormattedMessage
            {...messages.thresholdReachedStatusExplanation}
            values={{
              thresholdReachedStatusExplanationBold: (
                <b>
                  <FormattedMessage
                    {...messages.thresholdReachedStatusExplanationBold}
                  />
                </b>
              ),
            }}
          />
          <IconTooltip
            icon="info-outline"
            iconColor={theme.colors.tenantText}
            theme="light"
            placement="bottom"
            content={
              <T
                value={initiativeSettings.threshold_reached_message}
                supportHtml
              />
            }
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
        <VoteButtons onReaction={onReaction} userReacted={userReacted} />
      </Box>
    </Container>
  );
};

export default ThresholdReached;
