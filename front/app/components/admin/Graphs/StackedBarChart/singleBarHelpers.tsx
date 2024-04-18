import React from 'react';

import { LabelList } from 'recharts';

import { CornerRadius } from '../typings';

export const getCornerRadius =
  (stackLength: number, cornerRadius: number) =>
  ({ stackIndex }: { stackIndex: number }): CornerRadius => {
    const r = cornerRadius;
    if (stackIndex === 0 && stackLength === 1) return [r, r, r, r];
    if (stackIndex === 0) return [r, 0, 0, r];
    if (stackIndex === stackLength - 1) return [0, r, r, 0];

    return 0;
  };

const accumulate = (values: number[]) => {
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
  [statusRow]: [Record<string, number>],
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
