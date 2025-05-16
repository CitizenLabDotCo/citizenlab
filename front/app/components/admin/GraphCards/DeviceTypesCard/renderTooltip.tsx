import React from 'react';

import { Text } from '@citizenlab/cl2-component-library';
import { Tooltip } from 'recharts';

import TooltipOutline from 'components/admin/Graphs/_components/TooltipOutline';

import { FormattedMessage, useIntl } from 'utils/cl-intl';

import messages from './messages';
import { getTranslations } from './translations';

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
  const { formatMessage } = useIntl();
  const translations = getTranslations(formatMessage);

  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!payload || !payload[0]) return null;
  const { value, percentage, name } = payload[0].payload;

  return (
    <TooltipOutline label={translations[name]}>
      <Text color="blue500" mt="4px" mb="4px" fontSize="s">
        <FormattedMessage {...messages.count} />: {value} ({percentage}%)
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
