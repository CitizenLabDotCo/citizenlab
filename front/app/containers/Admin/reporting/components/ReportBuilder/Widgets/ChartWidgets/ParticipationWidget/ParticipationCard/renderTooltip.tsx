import React from 'react';

import { Box, Icon } from '@citizenlab/cl2-component-library';
import { Tooltip } from 'recharts';

import { ParticipationType } from 'api/graph_data_units/requestTypes';

import TooltipOutline from 'components/admin/Graphs/_components/TooltipOutline';
import { colors } from 'components/admin/Graphs/styling';
import { IResolution } from 'components/admin/ResolutionControl';

import { FormattedMessage, MessageDescriptor } from 'utils/cl-intl';
import { toFullMonth } from 'utils/dateUtils';

import messages from '../messages';
import { CombinedTimeSeriesRow } from '../typings';

interface CustomTooltipProps {
  label?: string;
  payload?: {
    name: string;
    dataKey: ParticipationType;
    payload: CombinedTimeSeriesRow;
    stroke: string;
  }[];
  resolution: IResolution;
}

const MESSAGES_MAP: Record<ParticipationType, MessageDescriptor> = {
  inputs: messages.inputs,
  comments: messages.comments,
  votes: messages.votes,
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
