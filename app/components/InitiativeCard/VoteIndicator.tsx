import React, { PureComponent } from 'react';
import styled from 'styled-components';

import GetTenant, { GetTenantChildProps } from 'resources/GetTenant';
import GetInitiative, { GetInitiativeChildProps } from 'resources/GetInitiative';
import GetInitiativeStatus, { GetInitiativeStatusChildProps } from 'resources/GetInitiativeStatus';

import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';

import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

const Container = styled.div``;

interface InputProps {
  initiativeId: string;

}
interface DataProps {
  tenant: GetTenantChildProps;
  initiative: GetInitiativeChildProps;
  initiativeStatus: GetInitiativeStatusChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {}

class VoteIndicator extends PureComponent<Props, State> {

  render() {
    const { initiative, initiativeStatus } = this.props;
    if (isNilOrError(initiative) || isNilOrError(initiativeStatus)) return null;

    return (
      <Container>
        Vote for me, vote for me!
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

const VoteIndicatorWithHOCs = VoteIndicator;

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <VoteIndicatorWithHOCs {...inputProps} {...dataProps} />}
  </Data>
);
