import React, { PureComponent } from 'react';
import { adopt } from 'react-adopt';
import { isNilOrError } from 'utils/helperUtils';

// components
import Survey from './survey';

// resources
import GetPhase, { GetPhaseChildProps } from 'resources/GetPhase';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../messages';

// styling
import styled from 'styled-components';
import { ScreenReaderOnly } from 'utils/a11y';

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
      phase.attributes.participation_method === 'survey' &&
      phase.attributes.survey_embed_url &&
      phase.attributes.survey_service
    ) {
      return (
        <Container>
          <ScreenReaderOnly>
            <FormattedMessage tagName="h3" {...messages.invisibleTitleSurvey} />
          </ScreenReaderOnly>
          <Survey
            className={className}
            projectId={projectId}
            phaseId={phase.id}
            surveyEmbedUrl={phase.attributes.survey_embed_url}
            surveyService={phase.attributes.survey_service}
          />
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
