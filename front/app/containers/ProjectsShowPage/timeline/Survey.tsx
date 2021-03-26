import React, { memo } from 'react';
import { isNilOrError } from 'utils/helperUtils';

// components
import Survey from '../shared/survey';

// hooks
import usePhase from 'hooks/usePhase';

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
