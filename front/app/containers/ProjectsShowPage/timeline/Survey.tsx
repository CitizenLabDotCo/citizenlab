import React, { memo } from 'react';
// styling
import styled from 'styled-components';
// hooks
import usePhase from 'hooks/usePhase';
import { ScreenReaderOnly } from 'utils/a11y';
// i18n
import { FormattedMessage } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';
import messages from 'containers/ProjectsShowPage/messages';
// components
import Survey from '../shared/survey';

const Container = styled.div`
  position: relative;
`;

interface Props {
  projectId: string;
  phaseId: string | null;
  className?: string;
}

const SurveyContainer = memo<Props>(({ projectId, phaseId, className }) => {
  const phase = usePhase(phaseId);

  if (
    !isNilOrError(phase) &&
    phase.attributes.participation_method === 'survey' &&
    phase.attributes.survey_embed_url &&
    phase.attributes.survey_service
  ) {
    return (
      <Container className={className || ''}>
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
});

export default SurveyContainer;
