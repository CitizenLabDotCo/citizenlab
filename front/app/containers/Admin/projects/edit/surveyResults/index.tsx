// Libraries
import React, { Fragment } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import { withRouter, WithRouterProps } from 'react-router';
import { adopt } from 'react-adopt';
import styled from 'styled-components';

// Services / Data loading
import GetProject, { GetProjectChildProps } from 'resources/GetProject';
import GetFeatureFlag from 'resources/GetFeatureFlag';
import GetPhases, { GetPhasesChildProps } from 'resources/GetPhases';

// Components
import ExportSurveyButton from './ExportSurveyButton';
import T from 'components/T';
import { SectionTitle, SectionDescription } from 'components/admin/Section';

// i18n
import messages from '../messages';
import { FormattedMessage } from 'utils/cl-intl';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 500px;
`;

interface InputProps {}

interface DataProps {
  project: GetProjectChildProps;
  surveys_enabled: boolean | null;
  typeform_enabled: boolean | null;
  phases: GetPhasesChildProps;
}

interface Props extends InputProps, DataProps {}

class SurveyResults extends React.PureComponent<Props> {
  renderButtons = () => {
    const { project, surveys_enabled, typeform_enabled, phases } = this.props;
    if (!isNilOrError(project) && surveys_enabled && typeform_enabled) {
      if (
        project.attributes.process_type === 'continuous' &&
        project.attributes.participation_method === 'survey' &&
        project.attributes.survey_service === 'typeform'
      ) {
        return <ExportSurveyButton type="project" id={project.id} />;
      }

      if (
        project.attributes.process_type === 'timeline' &&
        !isNilOrError(phases)
      ) {
        return phases
          .filter(
            (phase) =>
              phase.attributes.participation_method === 'survey' &&
              phase.attributes.survey_service === 'typeform'
          )
          .map((phase) => {
            return (
              <Fragment key={phase.id}>
                <h3>
                  <T value={phase.attributes.title_multiloc} />
                </h3>
                <ExportSurveyButton id={phase.id} type="phase" />
              </Fragment>
            );
          });
      }
      return null;
    }
    return null;
  };

  render() {
    return (
      <>
        <SectionTitle>
          <FormattedMessage {...messages.titleSurveyResults} />
        </SectionTitle>
        <SectionDescription>
          <FormattedMessage {...messages.subtitleSurveyResults} />
        </SectionDescription>
        <Container>{this.renderButtons()}</Container>
      </>
    );
  }
}

const Data = adopt<DataProps, InputProps & WithRouterProps>({
  surveys_enabled: <GetFeatureFlag name="surveys" />,
  typeform_enabled: <GetFeatureFlag name="typeform_surveys" />,
  phases: ({ params, render }) => (
    <GetPhases projectId={params.projectId}>{render}</GetPhases>
  ),
  project: ({ params, render }) => (
    <GetProject projectId={params.projectId}>{render}</GetProject>
  ),
});

export default withRouter<InputProps>(
  (inputProps: InputProps & WithRouterProps) => (
    <Data {...inputProps}>
      {(dataProps) => <SurveyResults {...inputProps} {...dataProps} />}
    </Data>
  )
);
