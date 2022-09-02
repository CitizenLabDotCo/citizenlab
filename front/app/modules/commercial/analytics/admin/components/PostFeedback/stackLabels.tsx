import React from 'react';
import { LabelList } from 'recharts';
import { StackedBarsRow } from '../../hooks/usePostsFeedback';

export const stackLabels = (
  [statusRow]: [StackedBarsRow],
  stackedBarColumns: string[],
  percentages: number[]
) => {
  const { cumulativeValues } = stackedBarColumns.reduce(
    (acc, column) => ({
      cumulativeValues: [
        ...acc.cumulativeValues,
        acc.total + statusRow[column],
      ],
      total: acc.total + statusRow[column],
    }),
    { cumulativeValues: [], total: 0 }
  );

  const valueAccessor = (payload) => {
    const index = cumulativeValues.indexOf(payload.value[1]);
    const percentage = percentages[index];
    if (percentage < 9) return '';
    return `${percentage}%`;
  };

  return () => (
    <LabelList position="center" valueAccessor={valueAccessor} fill="white" />
  );
};
