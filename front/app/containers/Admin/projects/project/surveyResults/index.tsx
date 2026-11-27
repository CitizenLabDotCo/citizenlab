import React, { Fragment } from 'react';

import styled from 'styled-components';

import usePhase from 'api/phases/usePhase';
import usePhases from 'api/phases/usePhases';

import useFeatureFlag from 'hooks/useFeatureFlag';
import useProjectBackofficeRedesign from 'hooks/useProjectBackofficeRedesign';

import { SectionTitle, SectionDescription } from 'components/admin/Section';
import T from 'components/T';

import { FormattedMessage } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';
import { useParams } from 'utils/router';

import ExternalSurveyInsights from '../insights/ExternalSurveyInsights';
import messages from '../messages';

import ExportSurveyButton from './ExportSurveyButton';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 500px;
`;

const SurveyResults = () => {
  const { projectId, phaseId } = useParams({
    from: '/$locale/admin/projects/$projectId/phases/$phaseId/survey-results',
  });
  const surveys_enabled = useFeatureFlag({ name: 'surveys' });
  const typeform_enabled = useFeatureFlag({ name: 'typeform_surveys' });
  const redesigned = useProjectBackofficeRedesign();
  const { data: phases } = usePhases(projectId);
  const { data: phase } = usePhase(redesigned ? phaseId : null);

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

  if (redesigned) {
    return phase ? <ExternalSurveyInsights phase={phase.data} /> : null;
  }

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
