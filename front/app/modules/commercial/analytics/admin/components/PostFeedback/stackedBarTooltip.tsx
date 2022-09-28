import React from 'react';

// components
import { Tooltip } from 'recharts';
import { Box } from '@citizenlab/cl2-component-library';

// styling
import { colors } from 'utils/styleUtils';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

// typings
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
            <Box
              p="8px"
              background="white"
              color={colors.primary}
              border={`1px solid ${colors.separation}`}
            >
              <Box
                display="flex"
                justifyContent="center"
                style={{
                  fontWeight: '700',
                }}
                mb="4px"
              >
                {label}
              </Box>
              <Box display="flex" justifyContent="center">
                <FormattedMessage {...messages.inputs} />: {value} ({percentage}
                %)
              </Box>
            </Box>
          );
        }}
      />
    );
