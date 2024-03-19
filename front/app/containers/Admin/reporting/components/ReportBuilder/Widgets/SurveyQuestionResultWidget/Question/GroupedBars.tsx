import React from 'react';

import { AttributesGrouped } from 'api/graph_data_units/responseTypes';

import SurveyBars from 'components/admin/Graphs/SurveyBars';

interface Props {
  attributes: AttributesGrouped;
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
