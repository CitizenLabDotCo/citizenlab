import React, { useState } from 'react';

import StackedBarChart from 'components/admin/Graphs/StackedBarChart';
import { getCornerRadius } from 'components/admin/Graphs/StackedBarChart/singleBarHelpers';
import { DEFAULT_CATEGORICAL_COLORS } from 'components/admin/Graphs/styling';

import { Data } from './typings';

interface Props {
  data: Data;
}

const Chart = ({ data }: Props) => {
  const [stackedBarHoverIndex, setStackedBarHoverIndex] = useState<
    number | undefined
  >();

  const onMouseOverStackedBar = ({ stackIndex }) => {
    setStackedBarHoverIndex(stackIndex);
  };

  const onMouseOutStackedBar = () => {
    setStackedBarHoverIndex(undefined);
  };

  const columns = Object.keys(data[0]);
  const statusColorById = columns.reduce(
    (acc, cur, i) => ({
      ...acc,
      [cur]: DEFAULT_CATEGORICAL_COLORS[i % DEFAULT_CATEGORICAL_COLORS.length],
    }),
    {}
  );

  return (
    <StackedBarChart
      data={data}
      height={40}
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
      // labels={stackLabels(
      //   stackedBarsData,
      //   stackedBarColumns,
      //   stackedBarPercentages
      // )}
      xaxis={{ hide: true, domain: [0, 'dataMax'] }}
      yaxis={{ hide: true, domain: ['dataMin', 'dataMax'] }}
      // tooltip={stackedBarTooltip(
      //   stackedBarHoverIndex,
      //   stackedBarsData,
      //   stackedBarColumns,
      //   stackedBarPercentages,
      //   stackedBarsLegendItems.map((item) => item.label)
      // )}
      // legend={{
      //   items: stackedBarsLegendItems,
      //   marginTop: 15,
      //   maintainGraphSize: true,
      // }}
      onMouseOver={onMouseOverStackedBar}
      onMouseOut={onMouseOutStackedBar}
    />
  );
};

export default Chart;
