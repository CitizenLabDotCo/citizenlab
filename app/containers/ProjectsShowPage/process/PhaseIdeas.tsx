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
  &.budgeting {
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
        let basketId: string | null = null;

        if (participationMethod === 'budgeting' && phase.relationships.user_basket.data) {
          basketId = phase.relationships.user_basket.data.id;
        }

        return (
          <Container className={className}>
            <StyledIdeaCards
              className={participationMethod}
              type="load-more"
              sort={'trending'}
              pageSize={12}
              phaseId={phase.id}
              showViewToggle={true}
              defaultView={phase.attributes.presentation_mode}
              participationMethod={participationMethod}
              participationContextId={phase.id}
              participationContextType="Phase"
              basketId={basketId}
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
