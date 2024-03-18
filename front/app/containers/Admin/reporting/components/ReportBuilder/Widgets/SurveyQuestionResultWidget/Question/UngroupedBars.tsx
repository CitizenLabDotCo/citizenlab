import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import { AttributesUngrouped } from 'api/graph_data_units/responseTypes';

import { DEFAULT_CATEGORICAL_COLORS } from 'components/admin/Graphs/styling';
import SurveyBars from 'components/admin/Graphs/SurveyBars';

interface Props {
  attributes: AttributesUngrouped;
}

const COLOR_SCHEME = [DEFAULT_CATEGORICAL_COLORS[0]];

const UngroupedBars = ({ attributes }: Props) => {
  return (
    <Box className="e2e-survey-question-ungrouped-bars">
      <SurveyBars
        grouped={false}
        answers={attributes.answers}
        totalResponses={attributes.totalPickCount}
        multilocs={attributes.multilocs}
        colorScheme={COLOR_SCHEME}
      />
    </Box>
  );
};

export default UngroupedBars;
