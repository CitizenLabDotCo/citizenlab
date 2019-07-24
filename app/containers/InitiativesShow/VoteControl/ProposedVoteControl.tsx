import React, { PureComponent } from 'react';
import styled from 'styled-components';
import moment from 'moment';

import { IInitiativeData } from 'services/initiatives';
import { IInitiativeStatusData } from 'services/initiativeStatuses';
import { ITenantSettings } from 'services/tenant';
import CountDown from './CountDown';

const Container = styled.div``;

const CountDownWrapper = styled.div`
  display: flex;
  flex-direction: row-reverse;
`;

interface InputProps {
  initiative: IInitiativeData;
  initiativeStatus: IInitiativeStatusData;
  initiativeSettings: NonNullable<ITenantSettings['initiatives']>;
}
interface DataProps {}

interface Props extends InputProps, DataProps {}

interface State {}

class ProposedVoteControl extends PureComponent<Props, State> {

  calculateCountdownTarget = () => {
    const { initiative, initiativeSettings: { days_limit } } = this.props;
    const mStart = moment(initiative.attributes.published_at);
    return mStart.add(days_limit, 'day');
  }

  render() {
    const { initiative } = this.props;
    return (
      <Container>
        <CountDownWrapper>
          <CountDown targetTime={this.calculateCountdownTarget()} />
        </CountDownWrapper>
      </Container>
    );
  }
}

export default ProposedVoteControl;
