import React from 'react';

// components
import { Box } from '@citizenlab/cl2-component-library';
import { Tooltip } from 'recharts';

// typings
import { TimeSeriesRow } from '../../hooks/useVisitorsData'

interface CustomTooltipProps {
  label?: string;
  payload?: {
    name: string;
    dataKey: string;
    payload: TimeSeriesRow;
  }[];
}

const CustomTooltip = ({ label, payload }: CustomTooltipProps) => {
  if (!payload) return null;

  return (
    <Box>
      TEST
    </Box>
  )
}

const renderTooltip = (props) => (
  <Tooltip
    {...props}
    content={(props) => (
      <CustomTooltip label={props.label} payload={props.payload as any} />
    )}
  />
);

export default renderTooltip;