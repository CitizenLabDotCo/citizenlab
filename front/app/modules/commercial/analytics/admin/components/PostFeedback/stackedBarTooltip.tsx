import React from 'react';
import { Tooltip } from 'recharts';
import { Box } from '@citizenlab/cl2-component-library';
import { StackedBarsRow } from '../../hooks/usePostsFeedback';

export const stackedBarTooltip =
  (
    stackIndex: number | undefined,
    [statusRow]: [StackedBarsRow],
    stackedBarColumns: string[],
    percentages: number[],
    labels: string[]
  ) =>
  (props) =>
    (
      <Tooltip
        {...props}
        cursor={{ fill: 'transparent' }}
        content={() => {
          if (stackIndex === undefined) return null;

          const label = labels[stackIndex];
          const value = statusRow[stackedBarColumns[stackIndex]];
          const percentage = percentages[stackIndex];

          return (
            <Box p="8px" background="white">
              {label}
              Value: {value} <br />
              Percentage: {percentage}
            </Box>
          );
        }}
      />
    );
