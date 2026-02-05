import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';

import messages from 'components/admin/GraphCards/InternalAdoptionCard/messages';
import StatisticBottomLabel from 'components/admin/Graphs/Statistic/StatisticBottomLabel';
import StatisticDelta, {
  getSignNumber,
} from 'components/admin/Graphs/Statistic/StatisticDelta';
import StatisticName from 'components/admin/Graphs/Statistic/StatisticName';

import { MessageDescriptor, useIntl } from 'utils/cl-intl';

import chartWidgetMessages from '../../messages';
import { Stats } from '../typings';

interface StatisticProps {
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
}: StatisticProps) => {
  const { formatMessage } = useIntl();

  return (
    <Box w="25%" pr="12px">
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

interface StatisticsProps {
  stats: Stats;
  previousDays?: number;
}

export const Statistics = ({ stats, previousDays }: StatisticsProps) => {
  return (
    <Box display="flex">
      <Statistic
        nameMessage={messages.activeAdmins}
        value={stats.activeAdmins.value}
        delta={stats.activeAdmins.change}
        previousDays={previousDays}
      />
      <Statistic
        nameMessage={messages.activeModerators}
        value={stats.activeModerators.value}
        delta={stats.activeModerators.change}
        previousDays={previousDays}
      />
      <Statistic
        nameMessage={messages.totalAdminPm}
        value={stats.totalAdminPm.value}
        delta={stats.totalAdminPm.change}
        previousDays={previousDays}
      />
    </Box>
  );
};
