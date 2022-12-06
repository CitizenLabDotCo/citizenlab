import React from 'react';
// components
import { Box } from '@citizenlab/cl2-component-library';
import { Tooltip } from 'recharts';
import { FormattedMessage } from 'utils/cl-intl';
// utils
import { toFullMonth } from 'utils/dateUtils';
// styling
import { colors } from 'components/admin/Graphs/styling';
import TooltipOutline from 'components/admin/Graphs/utilities/TooltipOutline';
// typings
import { IResolution } from 'components/admin/ResolutionControl';
// i18n
import messages from './messages';

type CustomTooltipProps = {
  label?: string;
  payload?:
    | [
        {
          payload?: {
            registrations: number;
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
        <FormattedMessage {...messages.newRegistrations} />:{' '}
        {payload[0].payload.registrations}
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
