import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';

import StatisticBottomLabel from 'components/admin/Graphs/Statistic/StatisticBottomLabel';
import StatisticDelta, {
  getSignNumber,
} from 'components/admin/Graphs/Statistic/StatisticDelta';
import StatisticName from 'components/admin/Graphs/Statistic/StatisticName';

import { MessageDescriptor, useIntl } from 'utils/cl-intl';

import chartWidgetMessages from '../../messages';

interface Props {
  nameMessage: MessageDescriptor;
  value: number;
  delta?: number;
  previousDays?: number;
}

export const Statistic = ({
  nameMessage,
  value,
  delta,
  previousDays,
}: Props) => {
  const { formatMessage } = useIntl();

  return (
    <Box>
      <StatisticName name={formatMessage(nameMessage)} nameColor="black" />
      <Box mt="2px">
        <Text color="textPrimary" fontSize="xl" display="inline">
          {value}
        </Text>
        {delta !== undefined && (
          <StatisticDelta delta={delta} sign={getSignNumber(delta)} />
        )}
      </Box>
      {delta !== undefined && previousDays && (
        <StatisticBottomLabel
          bottomLabel={formatMessage(
            chartWidgetMessages.comparedToPreviousXDays,
            {
              days: previousDays,
            }
          )}
        />
      )}
    </Box>
  );
};
