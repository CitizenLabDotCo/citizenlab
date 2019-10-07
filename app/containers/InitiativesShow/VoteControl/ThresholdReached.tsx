import React, { PureComponent } from 'react';
import styled from 'styled-components';
import { fontSizes } from 'utils/styleUtils';

import { IInitiativeData } from 'services/initiatives';
import { IInitiativeStatusData } from 'services/initiativeStatuses';
import { ITenantSettings } from 'services/tenant';

import Icon from 'components/UI/Icon';
import { StatusWrapper, StatusExplanation } from './SharedStyles';
import Button from 'components/UI/Button';

import T from 'components/T';
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

const Container = styled.div``;

const StatusIcon = styled(Icon)`
  path {
    fill: ${props => props.theme.colorText};
  }
  width: 40px;
  height: 40px;
  margin-bottom: 20px;
`;

const VoteText = styled.div`
  font-size: ${fontSizes.base}px;
  color: ${props => props.theme.colorText};
  margin-top: 20px;
`;

const StyledButton = styled(Button)`
  margin-top: 20px;
`;

interface InputProps {
  initiative: IInitiativeData;
  initiativeStatus: IInitiativeStatusData;
  initiativeSettings: NonNullable<ITenantSettings['initiatives']>;
  userVoted: boolean;
  onVote: () => void;
}
interface DataProps { }

interface Props extends InputProps, DataProps { }

interface State { }

class ThresholdReached extends PureComponent<Props, State> {

  handleOnVote = () => {
    this.props.onVote();
  }

  render() {
    const { initiative, initiativeSettings: { voting_threshold }, initiativeStatus, userVoted } = this.props;

    const voteCount = initiative.attributes.upvotes_count;
    const voteLimit = voting_threshold;

    return (
      <Container>
        <StatusWrapper>
          <T value={initiativeStatus.attributes.title_multiloc} />
        </StatusWrapper>
        <StatusIcon ariaHidden name="envelope-check" />
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
              )
            }}
          />
        </StatusExplanation>
        <VoteText>
          <FormattedMessage
            {...messages.xVotesOfY}
            values={{
              votingThreshold: voteLimit,
              xVotes: <b><FormattedMessage {...messages.xVotes} values={{ count: voteCount }} /></b>
            }}
          />
        </VoteText>
        {!userVoted &&
          <StyledButton
            icon="upvote"
            onClick={this.handleOnVote}
          >
            <FormattedMessage {...messages.vote} />
          </StyledButton>
        }
      </Container>
    );
  }
}

export default ThresholdReached;
