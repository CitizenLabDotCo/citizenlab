import React from 'react';

import { ResultGrouped } from 'api/survey_results/types';

import SurveyBars from 'components/admin/Graphs/SurveyBars';

interface Props {
  attributes: ResultGrouped;
  colorScheme: string[];
}

const GroupedBars = ({ attributes, colorScheme }: Props) => {
  return (
    <SurveyBars
      grouped={true}
      answers={attributes.answers}
      multilocs={attributes.multilocs}
      totalResponses={attributes.totalPickCount}
      colorScheme={colorScheme}
    />
  );
};

export default GroupedBars;
