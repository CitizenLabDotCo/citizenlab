import React from 'react';
import styled from 'styled-components';
import { colors, fontSizes, media } from 'utils/styleUtils';

import { IInitiativeStatusData } from 'api/initiative_statuses/types';
import { IAppConfigurationSettings } from 'api/app_configuration/types';

import { Box, Icon } from '@citizenlab/cl2-component-library';
import { StatusWrapper, StatusExplanation } from './SharedStyles';
import ProposalProgressBar from './ProposalProgressBar';
import Button from 'components/UI/Button';

import T from 'components/T';
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';
import { IInitiativeData } from 'api/initiatives/types';

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

const StyledButton = styled(Button)`
  margin-top: 20px;
`;

interface Props {
  initiative: IInitiativeData;
  initiativeStatus: IInitiativeStatusData;
  initiativeSettings: NonNullable<IAppConfigurationSettings['initiatives']>;
  userReacted: boolean;
}

const Expired = (props: Props) => {
  const {
    initiative,
    initiativeSettings: { reacting_threshold },
    initiativeStatus,
    userReacted,
  } = props;

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
      <StyledButton icon="halt" disabled>
        {userReacted ? (
          <FormattedMessage {...messages.cancelVote} />
        ) : (
          <FormattedMessage {...messages.vote} />
        )}
      </StyledButton>
    </Container>
  );
};

export default Expired;
