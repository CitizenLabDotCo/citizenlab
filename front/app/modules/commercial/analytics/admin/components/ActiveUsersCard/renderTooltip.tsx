import React from 'react';

// components
import { Box } from '@citizenlab/cl2-component-library';
import { Tooltip } from 'recharts';
import TooltipOutline from 'components/admin/Graphs/utilities/TooltipOutline';

// styling
import { colors } from 'components/admin/Graphs/styling';

// i18n
import messages from './messages';
import { FormattedMessage } from 'utils/cl-intl';

// utils
import { toFullMonth } from 'utils/dateUtils';

// typings
import { IResolution } from 'components/admin/ResolutionControl';

type CustomTooltipProps = {
  label?: string;
  payload?:
    | [
        {
          payload?: {
            activeUsers: number;
            date: string;
          };
        }
      ]
    | [];
  resolution: IResolution;
};

const CustomTooltip = ({ label, payload, resolution }: CustomTooltipProps) => {
  if (!payload?.[0]?.payload || !label) return null;

  return (
    <TooltipOutline label={toFullMonth(label, resolution)}>
      <Box py="0px">
        <FormattedMessage {...messages.activeUsers} />:{' '}
        {payload[0].payload.activeUsers}
      </Box>
    </TooltipOutline>
  );
};

const renderTooltip = (resolution: IResolution) => (props) =>
  (
    <Tooltip
      {...props}
      cursor={{ stroke: colors.gridHoverColor }}
      content={(props) => (
        <CustomTooltip
          label={props.label}
          payload={props.payload as any}
          resolution={resolution}
        />
      )}
    />
  );

export default renderTooltip;
