import React from 'react';

// components
import { Box, Icon } from '@citizenlab/cl2-component-library';
import { Tooltip } from 'recharts';
import TooltipOutline from 'components/admin/Graphs/utilities/TooltipOutline';

// styling
import { colors } from 'components/admin/Graphs/styling';

interface CustomTooltipProps {
  label?: string;
  payload?: {
    name: string;
    dataKey: string;
    payload: {
      color: string;
    };
  }[];
}

const CustomTooltip = ({ label, payload }: CustomTooltipProps) => {
  if (!payload || !label) return null;
  return (
    <TooltipOutline label={label}>
      {payload.map(({ dataKey, name, payload: { color } }) => (
        <Box py="0px" key={dataKey}>
          <Icon
            name="dot"
            width="8px"
            height="8px"
            fill={color}
            mr="6px"
            mt="-2px"
          />
          {name}: {payload[dataKey]}
        </Box>
      ))}
    </TooltipOutline>
  );
};

const renderTooltip = (label) => (props) =>
  (
    <Tooltip
      {...props}
      cursor={{ stroke: colors.gridHoverColor }}
      content={(props) => (
        <CustomTooltip payload={props.payload as any} label={label} />
      )}
    />
  );

export default renderTooltip;
