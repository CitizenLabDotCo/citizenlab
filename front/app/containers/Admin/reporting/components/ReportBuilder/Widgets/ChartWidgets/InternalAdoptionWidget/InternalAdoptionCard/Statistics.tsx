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
import { Stat, Stats } from '../typings';

interface StatisticProps {
  nameMessage: MessageDescriptor;
  stat: Stat;
  previousDays?: number;
  showActiveStats?: boolean;
}

export const Statistic = ({
  nameMessage,
  stat,
  previousDays,
  showActiveStats,
}: StatisticProps) => {
  const { formatMessage } = useIntl();
  const { registeredDelta, activeDelta } = stat;

  const showActiveDelta = showActiveStats && activeDelta !== undefined;
  const showRegisteredDelta = registeredDelta !== undefined;
  const showBottomLabel =
    (showActiveDelta || showRegisteredDelta) && !!previousDays;

  return (
    <Box w="25%" pr="12px">
      <StatisticName name={formatMessage(nameMessage)} nameColor="black" />
      <Box mt="2px">
        <Text color="textPrimary" fontSize="xl" display="inline">
          {stat.registered}
        </Text>
        {showRegisteredDelta && (
          <StatisticDelta
            delta={registeredDelta}
            sign={getSignNumber(registeredDelta)}
          />
        )}
      </Box>
      {showActiveStats && (
        <Box mt="4px">
          <Text color="textSecondary" fontSize="s" display="inline">
            {formatMessage(messages.totalActive)}:{' '}
          </Text>
          <Text
            color="textSecondary"
            fontSize="s"
            display="inline"
            fontWeight="bold"
          >
            {stat.active}
          </Text>
          {showActiveDelta && (
            <StatisticDelta
              delta={activeDelta}
              sign={getSignNumber(activeDelta)}
              fontSize="s"
            />
          )}
        </Box>
      )}
      {showBottomLabel && (
        <StatisticBottomLabel
          bottomLabel={formatMessage(
            chartWidgetMessages.comparedToPreviousXDays,
            { days: previousDays }
          )}
        />
      )}
    </Box>
  );
};

interface StatisticsProps {
  stats: Stats;
  previousDays?: number;
  showActiveStats?: boolean;
}

export const Statistics = ({
  stats,
  previousDays,
  showActiveStats,
}: StatisticsProps) => {
  return (
    <Box display="flex">
      <Statistic
        nameMessage={messages.admins}
        stat={stats.admins}
        previousDays={previousDays}
        showActiveStats={showActiveStats}
      />
      <Statistic
        nameMessage={messages.moderators}
        stat={stats.moderators}
        previousDays={previousDays}
        showActiveStats={showActiveStats}
      />
      <Statistic
        nameMessage={messages.total}
        stat={stats.total}
        previousDays={previousDays}
        showActiveStats={showActiveStats}
      />
    </Box>
  );
};
