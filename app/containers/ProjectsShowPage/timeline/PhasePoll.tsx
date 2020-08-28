import React, { PureComponent } from 'react';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';

// components
import Poll from '../poll';

// resources
import GetPhase, { GetPhaseChildProps } from 'resources/GetPhase';

// styling
import styled from 'styled-components';

const Container = styled.div`
  padding-bottom: 100px;
`;

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

class PhaseSurvey extends PureComponent<Props, State> {
  render() {
    const { projectId, phase, className } = this.props;

    if (
      !isNilOrError(phase) &&
      phase.attributes.participation_method === 'poll'
    ) {
      return (
        <Container
          className={`e2e-timeline-project-poll-container ${className || ''}`}
        >
          <Poll phaseId={phase.id} projectId={projectId} type="phase" />
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
    {(dataProps) => <PhaseSurvey {...inputProps} {...dataProps} />}
  </Data>
);
