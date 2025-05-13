import React, { useState } from 'react';

import StackedBarChart from 'components/admin/Graphs/StackedBarChart';
import {
  getCornerRadius,
  stackLabels,
} from 'components/admin/Graphs/StackedBarChart/singleBarHelpers';
import { colors } from 'components/admin/Graphs/styling';

import { isNilOrError, NilOrError } from 'utils/helperUtils';

import { PostFeedback } from '../usePostsFeedback/typings';

import { stackedBarTooltip } from './stackedBarTooltip';

interface Props {
  data: PostFeedback | NilOrError;
  innerRef: React.RefObject<any>;
}

const EMPTY_DATA = [{ x: 1 }];

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
    return (
      <StackedBarChart
        margin={{ top: 0 }}
        height={25}
        data={EMPTY_DATA}
        mapping={{
          stackedLength: ['x'],
          fill: () => colors.lightGrey,
          cornerRadius: getCornerRadius(EMPTY_DATA.length, 3),
        }}
        layout="horizontal"
        xaxis={{ hide: true, domain: [0, 'dataMax'] }}
        yaxis={{ hide: true, domain: ['dataMin', 'dataMax'] }}
      />
    );
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
