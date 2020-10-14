import React, { PureComponent } from 'react';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';

// components
import Volunteering from '../shared/volunteering';

// resources
import GetPhase, { GetPhaseChildProps } from 'resources/GetPhase';

// styling
import styled from 'styled-components';

const Container = styled.div``;

interface InputProps {
  projectId: string;
  phaseId: string | null;
  className?: string;
}

interface DataProps {
  phase: GetPhaseChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {}

class VolunteeringContainer extends PureComponent<Props, State> {
  render() {
    const { projectId, phase, className } = this.props;

    if (
      !isNilOrError(phase) &&
      phase.attributes.participation_method === 'volunteering'
    ) {
      return (
        <Container
          className={`e2e-timeline-project-volunteering-container ${
            className || ''
          }`}
        >
          <Volunteering phaseId={phase.id} projectId={projectId} type="phase" />
        </Container>
      );
    }

    return null;
  }
}

const Data = adopt<DataProps, InputProps>({
  phase: ({ phaseId, render }) => <GetPhase id={phaseId}>{render}</GetPhase>,
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {(dataProps) => <VolunteeringContainer {...inputProps} {...dataProps} />}
  </Data>
);
