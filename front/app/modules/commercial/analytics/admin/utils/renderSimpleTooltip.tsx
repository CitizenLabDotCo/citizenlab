import React from 'react';

// components
import { Box, Icon } from '@citizenlab/cl2-component-library';
import { Tooltip } from 'recharts';
import TooltipOutline from 'components/admin/Graphs/utilities/TooltipOutline';

// i18n
import { FormattedMessage } from 'utils/cl-intl';
import messages from '../components/messages';
interface CustomTooltipProps {
  label?: string;
  payload?: {
    name: string;
    value: number;
    payload: {
      color: string;
      percentage: number;
    };
  }[];
}

const CustomTooltip = ({ label, payload }: CustomTooltipProps) => {
  if (!payload || payload.length === 0 || !label) return null;
  const {
    name,
    value,
    payload: { percentage, color },
  } = payload[0];
  console.log(payload)
  return (
    <TooltipOutline label={name}>
      <Box py="0px">
        <Icon
          name="dot"
          width="8px"
          height="8px"
          fill={color}
          mr="6px"
          mt="-2px"
        />
        <FormattedMessage {...messages.tabVisitors} />: {value} ({percentage}%)
      </Box>
    </TooltipOutline>
  );
};

const renderTooltip = (label) => (props) =>
  (
    <Tooltip
      {...props}
      content={(props) => (
        <CustomTooltip payload={props.payload as any} label={label} />
      )}
    />
  );

export default renderTooltip;
