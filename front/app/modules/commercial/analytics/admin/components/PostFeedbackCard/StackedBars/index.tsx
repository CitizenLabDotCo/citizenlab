import React, { useState } from 'react';

// components
import StackedBarChart from 'components/admin/Graphs/StackedBarChart';
import { stackLabels } from './stackLabels';
import { stackedBarTooltip } from './stackedBarTooltip';

// utils
import { getCornerRadius } from './utils';
import { isNilOrError, NilOrError } from 'utils/helperUtils';

// typings
import { PostFeedback } from '../../../hooks/usePostsFeedback/typings';

interface Props {
  data: PostFeedback | NilOrError;
  innerRef: React.RefObject<any>;
}

const StackedBars = ({ data, innerRef }: Props) => {
  const [stackedBarHoverIndex, setStackedBarHoverIndex] = useState<
    number | undefined
  >();

  const onMouseOverStackedBar = ({ stackIndex }) => {
    setStackedBarHoverIndex(stackIndex);
  };

  const onMouseOutStackedBar = () => {
    setStackedBarHoverIndex(undefined);
  };

  if (isNilOrError(data)) {
    return null;
  }

  const {
    stackedBarsData,
    stackedBarColumns,
    statusColorById,
    stackedBarPercentages,
    stackedBarsLegendItems,
  } = data;

  return (
    <StackedBarChart
      data={stackedBarsData}
      height={25}
      mapping={{
        stackedLength: stackedBarColumns,
        fill: ({ stackIndex }) =>
          statusColorById[stackedBarColumns[stackIndex]],
        cornerRadius: getCornerRadius(stackedBarColumns.length, 3),
        opacity: ({ stackIndex }) => {
          if (stackedBarHoverIndex === undefined) return 1;
          return stackedBarHoverIndex === stackIndex ? 1 : 0.3;
        },
      }}
      layout="horizontal"
      labels={stackLabels(
        stackedBarsData,
        stackedBarColumns,
        stackedBarPercentages
      )}
      xaxis={{ hide: true, domain: [0, 'dataMax'] }}
      yaxis={{ hide: true, domain: ['dataMin', 'dataMax'] }}
      tooltip={stackedBarTooltip(
        stackedBarHoverIndex,
        stackedBarsData,
        stackedBarColumns,
        stackedBarPercentages,
        stackedBarsLegendItems.map((item) => item.label)
      )}
      legend={{
        items: stackedBarsLegendItems,
        marginTop: 15,
        maintainGraphSize: true,
      }}
      innerRef={innerRef}
      onMouseOver={onMouseOverStackedBar}
      onMouseOut={onMouseOutStackedBar}
    />
  );
};

export default StackedBars;
