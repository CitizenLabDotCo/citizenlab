import React, { Fragment } from 'react';

import styled from 'styled-components';

import usePhases from 'api/phases/usePhases';

import useFeatureFlag from 'hooks/useFeatureFlag';

import { SectionTitle, SectionDescription } from 'components/admin/Section';
import T from 'components/T';

import { FormattedMessage } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';
import { useParams } from 'utils/router';

import messages from '../messages';

import ExportSurveyButton from './ExportSurveyButton';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 500px;
`;

const SurveyResults = () => {
  const { projectId } = useParams({
    from: '/$locale/admin/projects/$projectId/phases/$phaseId/survey-results',
  });
  const surveys_enabled = useFeatureFlag({ name: 'surveys' });
  const typeform_enabled = useFeatureFlag({ name: 'typeform_surveys' });
  const { data: phases } = usePhases(projectId);

  const renderButtons = () => {
    if (surveys_enabled && typeform_enabled && !isNilOrError(phases)) {
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
              <ExportSurveyButton phaseId={phase.id} />
            </Fragment>
          );
        });
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
