import React, { memo } from 'react';

import styled from 'styled-components';

import usePhase from 'api/phases/usePhase';

import messages from 'containers/ProjectsShowPage/messages';

import { ScreenReaderOnly } from 'utils/a11y';
import { FormattedMessage } from 'utils/cl-intl';

import Survey from '../shared/survey';

const Container = styled.div`
  position: relative;
`;

interface Props {
  phaseId: string | null;
  className?: string;
}

const SurveyContainer = memo<Props>(({ phaseId, className }) => {
  const { data: phase } = usePhase(phaseId);

  if (
    phase &&
    phase.data.attributes.participation_method === 'survey' &&
    phase.data.attributes.survey_embed_url &&
    phase.data.attributes.survey_service
  ) {
    return (
      <Container className={className || ''}>
        <ScreenReaderOnly>
          <FormattedMessage tagName="h3" {...messages.invisibleTitleSurvey} />
        </ScreenReaderOnly>
        <Survey
          className={className}
          phase={phase.data}
          surveyEmbedUrl={phase.data.attributes.survey_embed_url}
          surveyService={phase.data.attributes.survey_service}
        />
      </Container>
    );
  }

  return null;
});

export default SurveyContainer;
