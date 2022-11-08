import React from 'react';
import { LabelList } from 'recharts';
import { StackedBarsRow } from '../../../hooks/usePostsFeedback/typings';

export const accumulate = (values: number[]) => {
  const { cumulativeValues } = values.reduce(
    (acc, value) => ({
      cumulativeValues: [...acc.cumulativeValues, acc.total + value],
      total: acc.total + value,
    }),
    { cumulativeValues: [], total: 0 }
  );
  return cumulativeValues;
};

export const stackLabels = (
  [statusRow]: [StackedBarsRow],
  stackedBarColumns: string[],
  percentages: number[]
) => {
  const values = stackedBarColumns.map((column) => statusRow[column]);
  const cumulativeValues = accumulate(values);

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
