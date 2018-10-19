import React, { PureComponent } from 'react';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';

// components
import IdeaCards from 'components/IdeaCards';

// resources
import GetPhase, { GetPhaseChildProps } from 'resources/GetPhase';

interface InputProps {
  phaseId: string | null;
}

interface DataProps {
  phase: GetPhaseChildProps;
}

interface Props extends InputProps, DataProps {}

interface State {}

class PhaseIdeas extends PureComponent<Props, State> {
  render() {
    const { phase } = this.props;

    if (!isNilOrError(phase)) {
      const participationMethod = phase.attributes.participation_method;

      if ((participationMethod === 'ideation' || participationMethod === 'budgeting')) {
        return (
          <IdeaCards
            className={this.props['className']}
            type="load-more"
            sort={'trending'}
            pageSize={12}
            phaseId={phase.id}
            showViewToggle={true}
            defaultView={phase.attributes.presentation_mode}
          />
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
