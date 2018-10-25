import React, { PureComponent } from 'react';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';

// components
import IdeaCards from 'components/IdeaCards';

// resources
import GetPhase, { GetPhaseChildProps } from 'resources/GetPhase';

// style
import styled from 'styled-components';

const Container = styled.div``;

const StyledIdeaCards = styled(IdeaCards)`
  &.pbIdeas {
    margin-top: 200px;
  }
`;

interface InputProps {
  phaseId: string | null;
  className?: string;
}

interface DataProps {
  phase: GetPhaseChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {}

class PhaseIdeas extends PureComponent<Props, State> {
  render() {
    const { phase, className } = this.props;

    if (!isNilOrError(phase)) {
      const participationMethod = phase.attributes.participation_method;

      if ((participationMethod === 'ideation' || participationMethod === 'budgeting')) {
        return (
          <Container className={className}>
            <StyledIdeaCards
              className={participationMethod === 'budgeting' ? 'pbIdeas' : ''}
              type="load-more"
              sort={'trending'}
              pageSize={12}
              phaseId={phase.id}
              showViewToggle={true}
              defaultView={phase.attributes.presentation_mode}
            />
          </Container>
        );
      }
    }

    return null;
  }
}

const Data = adopt<DataProps, InputProps>({
  phase: ({ phaseId, render }) => <GetPhase id={phaseId}>{render}</GetPhase>
});

export default (inputProps: InputProps) => (
  <Data {...inputProps}>
    {dataProps => <PhaseIdeas {...inputProps} {...dataProps} />}
  </Data>
);
