import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import { Tooltip } from 'recharts';
import { TooltipContentProps } from 'recharts/types/component/Tooltip';

import TooltipOutline from 'components/admin/Graphs/_components/TooltipOutline';
import { colors } from 'components/admin/Graphs/styling';
import { IResolution } from 'components/admin/ResolutionControl';

import { FormattedMessage } from 'utils/cl-intl';
import { toFullMonth } from 'utils/dateUtils';

import messages from './messages';

type CustomTooltipProps = {
  label: TooltipContentProps<string, string>['label'];
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
    <TooltipOutline label={toFullMonth(String(label), resolution)}>
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
