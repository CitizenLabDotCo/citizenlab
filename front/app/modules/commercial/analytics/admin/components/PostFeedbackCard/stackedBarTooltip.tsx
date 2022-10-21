import React from 'react';

// components
import { Box } from '@citizenlab/cl2-component-library';
import TooltipOutline from 'components/admin/Graphs/utilities/TooltipOutline';
import { Tooltip } from 'recharts';

// styling
// import { colors } from 'utils/styleUtils';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from './messages';

// typings
import { StackedBarsRow } from '../../hooks/usePostsFeedback/typings';

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
