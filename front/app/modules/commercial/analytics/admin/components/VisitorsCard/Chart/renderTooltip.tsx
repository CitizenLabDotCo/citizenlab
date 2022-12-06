import React from 'react';
import { Tooltip } from 'recharts';
// components
import { Box, Icon } from '@citizenlab/cl2-component-library';
// typings
import { TimeSeriesRow } from '../../../hooks/useVisitors/typings';
import { FormattedMessage, MessageDescriptor } from 'utils/cl-intl';
// utils
import { toFullMonth } from 'utils/dateUtils';
// styling
import { colors } from 'components/admin/Graphs/styling';
import TooltipOutline from 'components/admin/Graphs/utilities/TooltipOutline';
import { IResolution } from 'components/admin/ResolutionControl';
// i18n
import messages from '../messages';

type DataKey = 'visitors' | 'visits';

interface CustomTooltipProps {
  label?: string;
  payload?: {
    name: string;
    dataKey: DataKey;
    payload: TimeSeriesRow;
    stroke: string;
  }[];
  resolution: IResolution;
}

const MESSAGES_MAP: Record<DataKey, MessageDescriptor> = {
  visitors: messages.visitors,
  visits: messages.visits,
};

const CustomTooltip = ({ label, payload, resolution }: CustomTooltipProps) => {
  if (!payload || !label) return null;

  return (
    <TooltipOutline label={toFullMonth(label, resolution)}>
      {payload.map(({ stroke, dataKey, payload }) => (
        <Box py="0px" key={dataKey}>
          <Icon
            name="dot"
            width="8px"
            height="8px"
            fill={stroke}
            mr="6px"
            mt="-2px"
          />
          <FormattedMessage {...MESSAGES_MAP[dataKey]} />: {payload[dataKey]}
        </Box>
      ))}
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
