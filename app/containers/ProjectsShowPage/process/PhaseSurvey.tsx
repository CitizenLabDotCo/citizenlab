import React, { PureComponent } from 'react';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';

// components
import Survey from './survey';

// resources
import GetPhase, { GetPhaseChildProps } from 'resources/GetPhase';

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
      phase.attributes.participation_method === 'survey' &&
      phase.attributes.survey_embed_url &&
      phase.attributes.survey_service
    ) {
      return (
        <Survey
          className={className}
          projectId={projectId}
          phaseId={phase.id}
          surveyEmbedUrl={phase.attributes.survey_embed_url}
          surveyService={phase.attributes.survey_service}
        />
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
