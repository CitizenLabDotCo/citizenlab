import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { Tooltip } from 'recharts';

import TooltipOutline from 'components/admin/Graphs/_components/TooltipOutline';

import { FormattedMessage } from 'utils/cl-intl';

import messages from '../messages';

export const tooltip =
  (
    stackIndex: number | undefined,
    [row]: [Record<string, number>],
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
          const numberOfUsers = row[stackedBarColumns[stackIndex]];
          const percentageOfUsers = percentages[stackIndex];

          return (
            <TooltipOutline label={label}>
              <Box display="flex" justifyContent="center">
                <FormattedMessage
                  {...messages.users}
                  values={{
                    numberOfUsers,
                    percentageOfUsers,
                  }}
                />
              </Box>
            </TooltipOutline>
          );
        }}
      />
    );
