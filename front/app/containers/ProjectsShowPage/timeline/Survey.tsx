import React, { memo } from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import { IPhaseData, TSurveyService } from 'api/phases/types';

import messages from 'containers/ProjectsShowPage/messages';

import { ScreenReaderOnly } from 'utils/a11y';
import { FormattedMessage } from 'utils/cl-intl';

import Survey from '../shared/survey';

interface Props {
  phase: IPhaseData;
  surveyEmbedUrl: string;
  surveyService: TSurveyService;
  className?: string;
}

const SurveyContainer = memo<Props>(
  ({ phase, surveyEmbedUrl, surveyService, className }) => (
    <Box position="relative" className={className || ''}>
      <ScreenReaderOnly>
        <FormattedMessage tagName="h3" {...messages.invisibleTitleSurvey} />
      </ScreenReaderOnly>
      <Survey
        className={className}
        phase={phase}
        surveyEmbedUrl={surveyEmbedUrl}
        surveyService={surveyService}
      />
    </Box>
  )
);

export default SurveyContainer;
