import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { Tooltip } from 'recharts';

import TooltipOutline from 'components/admin/Graphs/_components/TooltipOutline';

import { FormattedMessage } from 'utils/cl-intl';

import messages from '../messages';

export const stackedBarTooltip =
  (
    stackIndex: number | undefined,
    [statusRow]: [Record<string, number>],
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
            <TooltipOutline label={label}>
              <Box display="flex" justifyContent="center">
                <FormattedMessage {...messages.inputs} />: {value} ({percentage}
                %)
              </Box>
            </TooltipOutline>
          );
        }}
      />
    );
