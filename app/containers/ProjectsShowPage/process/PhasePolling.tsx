// TODO responsible for checking the phase is a poll and if so showing the form
import React, { PureComponent } from 'react';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';

// components
import PollSection from '../PollSection';

// resources
import GetPhase, { GetPhaseChildProps } from 'resources/GetPhase';

// styling
import styled from 'styled-components';

const Container = styled.div`
  padding-bottom: 100px;
`;

interface InputProps {
  projectId: string; // TODO remove?
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
        <Container className={className || ''}>
          <PollSection
            id={phase.id}
            type="phases"
          />
        </Container>
      );
    }

    return null;
  }
}

const Data = adopt<DataProps, InputProps>({
  phase: ({ phaseId, render }) => <GetPhase id={phaseId}>{render}</GetPhase>
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <PhaseSurvey {...inputProps} {...dataProps} />}
  </Data>
);
