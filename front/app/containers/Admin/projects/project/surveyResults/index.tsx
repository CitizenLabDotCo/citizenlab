// Libraries
import React, { Fragment } from 'react';
import { isNilOrError } from 'utils/helperUtils';
import styled from 'styled-components';
import useProjectById from 'api/projects/useProjectById';

// Components
import ExportSurveyButton from './ExportSurveyButton';
import T from 'components/T';
import { SectionTitle, SectionDescription } from 'components/admin/Section';

// i18n
import messages from '../messages';
import { FormattedMessage } from 'utils/cl-intl';
import { useParams } from 'react-router-dom';
import useFeatureFlag from 'hooks/useFeatureFlag';
import usePhases from 'api/phases/usePhases';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 500px;
`;

const SurveyResults = () => {
  const { projectId } = useParams() as { projectId: string };
  const surveys_enabled = useFeatureFlag({ name: 'surveys' });
  const typeform_enabled = useFeatureFlag({ name: 'typeform_surveys' });
  const { data: project } = useProjectById(projectId);
  const { data: phases } = usePhases(projectId);

  const renderButtons = () => {
    if (project && surveys_enabled && typeform_enabled) {
      if (
        project.data.attributes.process_type === 'continuous' &&
        project.data.attributes.participation_method === 'survey' &&
        project.data.attributes.survey_service === 'typeform'
      ) {
        return <ExportSurveyButton type="project" id={project.data.id} />;
      }

      if (
        project.data.attributes.process_type === 'timeline' &&
        !isNilOrError(phases)
      ) {
        return phases.data
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
    }
    return null;
  };

  return (
    <>
      <SectionTitle>
        <FormattedMessage {...messages.titleSurveyResults} />
      </SectionTitle>
      <SectionDescription>
        <FormattedMessage {...messages.subtitleSurveyResults} />
      </SectionDescription>
      <Container>{renderButtons()}</Container>
    </>
  );
};

export default SurveyResults;
