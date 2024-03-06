import React from 'react';

import { Text } from '@citizenlab/cl2-component-library';
import { Tooltip } from 'recharts';

import messages from 'containers/Admin/dashboard/messages';

import TooltipOutline from 'components/admin/Graphs/_components/TooltipOutline';

import { FormattedMessage } from 'utils/cl-intl';

interface CustomTooltipProps {
  payload?: [
    {
      payload: {
        fill: string;
        name: string;
        value: number;
        percentage: number;
      };
    }
  ];
}

const CustomTooltip = ({ payload }: CustomTooltipProps) => {
  if (!payload || !payload[0]) return null;
  const { value, percentage, name } = payload[0].payload;

  return (
    <TooltipOutline label={name}>
      <Text color="blue500" mt="4px" mb="4px" fontSize="s">
        <FormattedMessage {...messages.tabUsers} />: {value} ({percentage}%)
      </Text>
    </TooltipOutline>
  );
};

const renderTooltip = () => (props) =>
  (
    <Tooltip
      {...props}
      content={(props) => <CustomTooltip payload={props.payload as any} />}
    />
  );

export default renderTooltip;
