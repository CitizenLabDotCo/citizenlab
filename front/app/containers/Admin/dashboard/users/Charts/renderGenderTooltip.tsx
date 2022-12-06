import React from 'react';
import { Tooltip } from 'recharts';
// components
import { Text } from '@citizenlab/cl2-component-library';
import { FormattedMessage } from 'utils/cl-intl';
// i18n
import messages from 'containers/Admin/dashboard/messages';
import TooltipOutline from 'components/admin/Graphs/utilities/TooltipOutline';

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
