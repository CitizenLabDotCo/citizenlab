import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import { ResultUngrouped } from 'api/survey_results/types';

import { DEFAULT_CATEGORICAL_COLORS } from 'components/admin/Graphs/styling';
import SurveyBars from 'components/admin/Graphs/SurveyBars';

interface Props {
  attributes: ResultUngrouped;
}

const COLOR_SCHEME = [DEFAULT_CATEGORICAL_COLORS[0]];

const UngroupedBars = ({ attributes }: Props) => {
  return (
    <Box className="e2e-survey-question-ungrouped-bars">
      {attributes.multilocs && (
        <SurveyBars
          grouped={false}
          answers={attributes.answers}
          totalResponses={attributes.totalPickCount}
          multilocs={attributes.multilocs}
          colorScheme={COLOR_SCHEME}
        />
      )}
    </Box>
  );
};

export default UngroupedBars;
