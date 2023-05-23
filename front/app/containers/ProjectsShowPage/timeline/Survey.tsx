import React, { memo } from 'react';

// components
import Survey from '../shared/survey';

// hooks
import usePhase from 'api/phases/usePhase';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from 'containers/ProjectsShowPage/messages';

// styling
import styled from 'styled-components';
import { ScreenReaderOnly } from 'utils/a11y';

const Container = styled.div`
  position: relative;
`;

interface Props {
  projectId: string;
  phaseId: string | null;
  className?: string;
}

const SurveyContainer = memo<Props>(({ projectId, phaseId, className }) => {
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
          projectId={projectId}
          phaseId={phase.data.id}
          surveyEmbedUrl={phase.data.attributes.survey_embed_url}
          surveyService={phase.data.attributes.survey_service}
        />
      </Container>
    );
  }

  return null;
});

export default SurveyContainer;
