import React from 'react';
import styled, { useTheme } from 'styled-components';
import {
  fontSizes,
  Box,
  Icon,
  IconTooltip,
  media,
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
import ProposalProgressBar from '../ProposalProgressBar';
import VoteButtons from './components/VoteButtons';

const Container = styled.div``;

const StatusIcon = styled(Icon)`
  path {
    fill: ${(props) => props.theme.colors.tenantText};
  }
  width: 30px;
  height: 30px;
  margin-bottom: 20px;
`;

const ReactionCounter = styled.div`
  margin-top: 15px;
  ${media.tablet`
    display: none;
  `}
`;

const ReactionText = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding-bottom: 4px;
`;

const ReactionTextLeft = styled.div`
  font-size: ${fontSizes.base}px;
  color: ${(props) => props.theme.colors.tenantPrimary};
`;

const ReactionTextRight = styled.div`
  font-size: ${fontSizes.base}px;
  color: ${(props) => props.theme.colors.tenantText};
`;

const ThresholdReached = ({
  initiative,
  initiativeSettings: { reacting_threshold, threshold_reached_message },
  initiativeStatus,
  userReacted,
  onReaction,
}: StatusComponentProps) => {
  const theme = useTheme();
  const reactionCount = initiative.attributes.likes_count;
  const reactionLimit = reacting_threshold;

  return (
    <Container>
      <Box mb="16px">
        <StatusWrapper>
          <T value={initiativeStatus.attributes.title_multiloc} />
        </StatusWrapper>
      </Box>
      <StatusIcon ariaHidden name="email-check" />
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
          content={<T value={threshold_reached_message} supportHtml />}
        />
      </StatusExplanation>
      <Box mb="24px">
        <ReactionCounter>
          <ReactionText aria-hidden={true}>
            <ReactionTextLeft>
              <FormattedMessage
                {...messages.xVotes}
                values={{ count: reactionCount }}
              />
            </ReactionTextLeft>
            <ReactionTextRight>{reactionLimit}</ReactionTextRight>
          </ReactionText>
          <ProposalProgressBar
            reactionCount={reactionCount}
            reactionLimit={reactionLimit}
            barColor={colors.green500}
          />
        </ReactionCounter>
      </Box>
      <Box mb="8px">
        <VoteButtons onReaction={onReaction} userReacted={userReacted} />
      </Box>
    </Container>
  );
};

export default ThresholdReached;
