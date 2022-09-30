import React, { PureComponent } from 'react';
import styled from 'styled-components';
import { colors, fontSizes, media } from 'utils/styleUtils';

import { IInitiativeData } from 'services/initiatives';
import { IInitiativeStatusData } from 'services/initiativeStatuses';
import { IAppConfigurationSettings } from 'services/appConfiguration';

import { Icon } from '@citizenlab/cl2-component-library';
import { StatusWrapper, StatusExplanation } from './SharedStyles';
import ProposalProgressBar from './ProposalProgressBar';
import Button from 'components/UI/Button';

import T from 'components/T';
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

const Container = styled.div``;

const StatusIcon = styled(Icon)`
  path {
    fill: ${colors.coolGrey600};
  }
  width: 30px;
  height: 30px;
  margin-bottom: 20px;
`;

const VoteCounter = styled.div`
  margin-top: 15px;
  ${media.tablet`
    display: none;
  `}
`;

const VoteTexts = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding-bottom: 4px;
`;

const VoteText = styled.div`
  font-size: ${fontSizes.base}px;
  color: ${colors.coolGrey600};
`;

const StyledButton = styled(Button)`
  margin-top: 20px;
`;

interface InputProps {
  initiative: IInitiativeData;
  initiativeStatus: IInitiativeStatusData;
  initiativeSettings: NonNullable<IAppConfigurationSettings['initiatives']>;
  userVoted: boolean;
}
interface DataProps {}

interface Props extends InputProps, DataProps {}

interface State {}

class Expired extends PureComponent<Props, State> {
  render() {
    const {
      initiative,
      initiativeSettings: { voting_threshold },
      initiativeStatus,
      userVoted,
    } = this.props;

    const voteCount = initiative.attributes.upvotes_count;
    const voteLimit = voting_threshold;

    return (
      <Container>
        <StatusWrapper>
          <T value={initiativeStatus.attributes.title_multiloc} />
        </StatusWrapper>
        <StatusIcon ariaHidden name="clock" />
        <StatusExplanation>
          <FormattedMessage
            {...messages.expiredStatusExplanation}
            values={{
              expiredStatusExplanationBold: (
                <b>
                  <FormattedMessage
                    {...messages.expiredStatusExplanationBold}
                    values={{ votingThreshold: voting_threshold }}
                  />
                </b>
              ),
            }}
          />
        </StatusExplanation>
        <VoteCounter>
          <VoteTexts aria-hidden={true}>
            <VoteText>
              <FormattedMessage
                {...messages.xVotes}
                values={{ count: voteCount }}
              />
            </VoteText>
            <VoteText>{voteLimit}</VoteText>
          </VoteTexts>
          <ProposalProgressBar
            voteCount={voteCount}
            voteLimit={voteLimit}
            barColor="linear-gradient(270deg, #84939E 0%, #C8D0D6 100%)"
            bgShaded
          />
        </VoteCounter>
        <StyledButton icon="halt" disabled>
          {userVoted ? (
            <FormattedMessage {...messages.cancelVote} />
          ) : (
            <FormattedMessage {...messages.vote} />
          )}
        </StyledButton>
      </Container>
    );
  }
}

export default Expired;
