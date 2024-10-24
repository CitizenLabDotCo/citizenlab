import React, { useState } from 'react';

import { DemographicsResponse } from 'api/graph_data_units/responseTypes/DemographicsWidget';

import useLocalize from 'hooks/useLocalize';

import BaseStackedBarChart from 'components/admin/Graphs/StackedBarChart';
import {
  getCornerRadius,
  stackLabels,
} from 'components/admin/Graphs/StackedBarChart/singleBarHelpers';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

import DemographicsLegend from './DemographicsLegend';
import { parseResponse } from './parse';
import { tooltip } from './tooltip';

interface Props {
  response: DemographicsResponse;
}

const StackedBarChart = ({ response }: Props) => {
  const localize = useLocalize();
  const { formatMessage } = useIntl();

  const [stackedBarHoverIndex, setStackedBarHoverIndex] = useState<
    number | undefined
  >();

  const onMouseOverStackedBar = ({ stackIndex }) => {
    setStackedBarHoverIndex(stackIndex);
  };

  const onMouseOutStackedBar = () => {
    setStackedBarHoverIndex(undefined);
  };

  const { data, percentages, columns, statusColorById, labels, legendItems } =
    parseResponse(response, localize, formatMessage(messages.unknown));

  return (
    <BaseStackedBarChart
      data={data}
      height={30}
      mapping={{
        stackedLength: columns,
        fill: ({ stackIndex }) => statusColorById[columns[stackIndex]],
        cornerRadius: getCornerRadius(columns.length, 3),
        opacity: ({ stackIndex }) => {
          if (stackedBarHoverIndex === undefined) return 1;
          return stackedBarHoverIndex === stackIndex ? 1 : 0.3;
        },
      }}
      layout="horizontal"
      labels={stackLabels(data, columns, percentages)}
      xaxis={{ hide: true, domain: [0, 'dataMax'] }}
      yaxis={{ hide: true, domain: ['dataMin', 'dataMax'] }}
      tooltip={tooltip(
        stackedBarHoverIndex,
        data,
        columns,
        percentages,
        labels
      )}
      legend={{
        items: legendItems,
        marginTop: 15,
        maintainGraphSize: true,
      }}
      onMouseOver={onMouseOverStackedBar}
      onMouseOut={onMouseOutStackedBar}
      CustomLegend={DemographicsLegend}
    />
  );
};

export default StackedBarChart;
