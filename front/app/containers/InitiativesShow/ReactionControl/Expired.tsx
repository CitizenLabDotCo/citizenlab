import React from 'react';
import styled from 'styled-components';
import {
  colors,
  fontSizes,
  media,
  Box,
  Icon,
} from '@citizenlab/cl2-component-library';
import { StatusWrapper, StatusExplanation } from './SharedStyles';
import ProposalProgressBar from './ProposalProgressBar';
import T from 'components/T';
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';
import { StatusComponentProps } from './Status';

const Container = styled.div``;

const StatusIcon = styled(Icon)`
  path {
    fill: ${colors.coolGrey600};
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

const ReactionTexts = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding-bottom: 4px;
`;

const ReactionText = styled.div`
  font-size: ${fontSizes.base}px;
  color: ${colors.coolGrey600};
`;

const Expired = ({
  initiative,
  initiativeSettings: { reacting_threshold },
  initiativeStatus,
}: StatusComponentProps) => {
  const reactionCount = initiative.attributes.likes_count;
  const reactionLimit = reacting_threshold;

  return (
    <Container>
      <Box mb="16px">
        <StatusWrapper>
          <T value={initiativeStatus.attributes.title_multiloc} />
        </StatusWrapper>
      </Box>
      <StatusIcon ariaHidden name="clock" />
      <StatusExplanation>
        <FormattedMessage
          {...messages.expiredStatusExplanation}
          values={{
            expiredStatusExplanationBold: (
              <b>
                <FormattedMessage
                  {...messages.expiredStatusExplanationBold}
                  values={{ votingThreshold: reacting_threshold }}
                />
              </b>
            ),
          }}
        />
      </StatusExplanation>
      <ReactionCounter>
        <ReactionTexts aria-hidden={true}>
          <ReactionText>
            <FormattedMessage
              {...messages.xVotes}
              values={{ count: reactionCount }}
            />
          </ReactionText>
          <ReactionText>{reactionLimit}</ReactionText>
        </ReactionTexts>
        <ProposalProgressBar
          reactionCount={reactionCount}
          reactionLimit={reactionLimit}
          barColor="linear-gradient(270deg, #84939E 0%, #C8D0D6 100%)"
          bgShaded
        />
      </ReactionCounter>
    </Container>
  );
};

export default Expired;
