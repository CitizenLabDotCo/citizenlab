import React, { PureComponent } from 'react';
import styled from 'styled-components';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';

import { InitiativeStatusCode, IInitiativeStatusData } from 'services/initiativeStatuses';
import GetInitiative, { GetInitiativeChildProps } from 'resources/GetInitiative';
import GetInitiativeStatus, { GetInitiativeStatusChildProps } from 'resources/GetInitiativeStatus';

import ProposedVoteControl from './ProposedVoteControl';
import ExpiredVoteControl from './ExpiredVoteControl';
import ThresholdReachedVoteControl from './ThresholdReachedVoteControl';
import AnsweredVoteControl from './AnsweredVoteControl';
import IneligibleVoteControl from './IneligibleVoteControl';
import CustomVoteControl from './CustomVoteControl';

import { IInitiativeData } from 'services/initiatives';
import { ITenantSettings } from 'services/tenant';
import GetTenant, { GetTenantChildProps } from 'resources/GetTenant';

const Container = styled.div``;

interface VoteControlComponentProps {
  initiative: IInitiativeData;
  initiativeStatus: IInitiativeStatusData;
  initiativeSettings: ITenantSettings['initiatives'];
}

const statusCodeToComponent: {[key in InitiativeStatusCode]: React.ComponentType<VoteControlComponentProps>} = {
  proposed: ProposedVoteControl,
  expired: ExpiredVoteControl,
  threshold_reached: ThresholdReachedVoteControl,
  answered: AnsweredVoteControl,
  ineligible: IneligibleVoteControl,
  custom: CustomVoteControl,
};

interface InputProps {
  initiativeId: string;
}

interface DataProps {
  tenant: GetTenantChildProps,
  initiative: GetInitiativeChildProps;
  initiativeStatus: GetInitiativeStatusChildProps;
}

interface Props extends InputProps, DataProps {}

class VoteControl extends PureComponent<Props> {

  render() {
    const { initiative, initiativeStatus, tenant } = this.props;

    if (isNilOrError(initiative) ||
      isNilOrError(initiativeStatus) ||
      isNilOrError(tenant) ||
      !tenant.attributes.settings.initiatives
    ) return null;

    const statusCode = initiativeStatus.attributes.code;
    const StatusComponent = statusCodeToComponent[statusCode];
    const initiativeSettings = tenant.attributes.settings.initiatives;

    return (
      <Container>
        <StatusComponent
          initiative={initiative}
          initiativeStatus={initiativeStatus}
          initiativeSettings={initiativeSettings}
        />
      </Container>
    );
  }
}

const Data = adopt<DataProps, InputProps>({
  tenant: <GetTenant />,
  initiative: ({ initiativeId, render }) => <GetInitiative id={initiativeId}>{render}</GetInitiative>,
  initiativeStatus: ({ initiative, render }) => {
    if (!isNilOrError(initiative) && initiative.relationships.initiative_status && initiative.relationships.initiative_status.data) {
      return <GetInitiativeStatus id={initiative.relationships.initiative_status.data.id}>{render}</GetInitiativeStatus>;
    } else {
      return null;
    }
  }
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <VoteControl {...inputProps} {...dataProps} />}
  </Data>
);
