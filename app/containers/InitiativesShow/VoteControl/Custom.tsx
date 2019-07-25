import React, { PureComponent } from 'react';
import moment from 'moment';

import styled, { withTheme } from 'styled-components';
import { colors, fontSizes } from 'utils/styleUtils';
import { StatusExplanation } from './SharedStyles';

import { IInitiativeData } from 'services/initiatives';
import { IInitiativeStatusData } from 'services/initiativeStatuses';
import { ITenantSettings } from 'services/tenant';

import CountDown from './CountDown';
import ProgressBar from 'components/UI/ProgressBar';
import Button from 'components/UI/Button';

import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';
import T from 'components/T';

const Container = styled.div``;

const CountDownWrapper = styled.div`
  display: flex;
  flex-direction: row-reverse;
`;

const VoteCounter = styled.div`
  margin-top: 15px;
`;

const VoteText = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding-bottom: 4px;
`;

const VoteTextLeft = styled.div`
  font-size: ${fontSizes.base}px;
  color: ${props => props.theme.colorMain};
`;

const VoteTextRight = styled.div`
  font-size: ${fontSizes.base}px;
  color: ${props => props.theme.colorText};
`;

const StyledProgressBar = styled(ProgressBar)`
  height: 12px;
  width: 100%;
`;

const StyledButton = styled(Button)`
  margin-top: 20px;
`;

interface InputProps {
  initiative: IInitiativeData;
  initiativeStatus: IInitiativeStatusData;
  initiativeSettings: NonNullable<ITenantSettings['initiatives']>;
  userVoted: boolean;
}
interface DataProps { }

interface Props extends InputProps, DataProps { }

class Custom extends PureComponent<Props & { theme: any }> {

  calculateCountdownTarget = () => {
    const { initiative, initiativeSettings: { days_limit } } = this.props;
    const mStart = moment(initiative.attributes.published_at);
    return mStart.add(days_limit, 'day');
  }

  render() {
    const { initiative, initiativeStatus, initiativeSettings: { voting_threshold }, theme, userVoted } = this.props;
    const voteCount = initiative.attributes.upvotes_count;
    const voteLimit = voting_threshold || 1;
    return (
      <Container>
        <CountDownWrapper>
          <CountDown targetTime={this.calculateCountdownTarget()} />
        </CountDownWrapper>
        <StatusExplanation>
          <T value={initiativeStatus.attributes.description_multiloc} />
        </StatusExplanation>
        <VoteCounter>
          <VoteText>
            <VoteTextLeft>
              <FormattedMessage {...messages.xVotes} values={{ count: voteCount }} />
            </VoteTextLeft>
            <VoteTextRight>
              {voteLimit}
            </VoteTextRight>
          </VoteText>
          <StyledProgressBar
            progress={voteCount / voteLimit}
            color={theme.colorMain}
            bgColor={colors.lightGreyishBlue}
          />
        </VoteCounter>
        {!userVoted &&
          <StyledButton
            icon="upvote"
            style="primary"
          >
            <FormattedMessage {...messages.vote} />
          </StyledButton>
        }
      </Container>
    );
  }
}

export default withTheme(Custom);
