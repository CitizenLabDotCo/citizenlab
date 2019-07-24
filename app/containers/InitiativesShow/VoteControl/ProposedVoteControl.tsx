import React, { PureComponent } from 'react';
import moment from 'moment';

import styled from 'styled-components';
import { StatusExplanation, TooltipWrapper, HelpIcon } from './SharedStyles';

import { IInitiativeData } from 'services/initiatives';
import { IInitiativeStatusData } from 'services/initiativeStatuses';
import { ITenantSettings } from 'services/tenant';

import CountDown from './CountDown';
import Icon from 'components/UI/Icon';
import Tooltip from 'components/UI/Tooltip';

import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';
import T from 'components/T';

const Container = styled.div``;

const CountDownWrapper = styled.div`
  display: flex;
  flex-direction: row-reverse;
`;

const StatusIcon = styled(Icon)`
  path {
    fill: ${props => props.theme.colorMain};
  }
  width: 31px;
  height: 31px;
  margin-bottom: 10px;
`;

const StyledTooltip = styled(Tooltip)`
  display: inline;
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
    const { initiativeSettings: { voting_threshold, eligibility_criteria } } = this.props;
    return (
      <Container>
        <CountDownWrapper>
          <CountDown targetTime={this.calculateCountdownTarget()} />
        </CountDownWrapper>
        <StatusIcon name="bullseye" />
        <StatusExplanation>
          <FormattedMessage
            {...messages.proposedStatusExplanation}
            values={{
              votingThreshold: voting_threshold,
              proposedStatusExplanationBold: <b><FormattedMessage {...messages.proposedStatusExplanationBold} /></b>
            }}
          />
          {eligibility_criteria &&
            <StyledTooltip
              content={
                <TooltipWrapper>
                  <T value={eligibility_criteria} supportHtml />
                </TooltipWrapper>
              }
              top="20"
            >
              <HelpIcon name="info" />
            </StyledTooltip>
          }
        </StatusExplanation>
      </Container>
    );
  }
}

export default ProposedVoteControl;
