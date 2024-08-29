import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';

import dashboardCardMessages from 'components/admin/GraphCards/ParticipantsCard/messages';
import StatisticBottomLabel from 'components/admin/Graphs/Statistic/StatisticBottomLabel';
import StatisticDelta, {
  getSignNumber,
} from 'components/admin/Graphs/Statistic/StatisticDelta';
import StatisticName from 'components/admin/Graphs/Statistic/StatisticName';

import { useIntl } from 'utils/cl-intl';

import chartWidgetMessages from '../../messages';
import messages from '../messages';
import { Stats } from '../typings';

interface Props {
  stats: Stats;
  previousDays?: number;
}

export const ParticipantsStatistic = ({ stats, previousDays }: Props) => {
  const { formatMessage } = useIntl();

  return (
    <Box>
      <StatisticName
        name={formatMessage(chartWidgetMessages.totalParticipants)}
        nameColor="black"
      />
      <Box mt="2px">
        <Text color="textPrimary" fontSize="xl" display="inline">
          {stats.participants.value}
        </Text>
        {stats.participants.delta !== undefined && (
          <StatisticDelta
            delta={stats.participants.delta}
            sign={getSignNumber(stats.participants.delta)}
          />
        )}
      </Box>
      {stats.participants.delta !== undefined && previousDays && (
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

export const ParticipationRateStatistic = ({ stats, previousDays }: Props) => {
  const { formatMessage } = useIntl();

  return (
    <Box>
      <StatisticName
        name={formatMessage(messages.participationRate)}
        nameColor="black"
        tooltipContent={formatMessage(
          dashboardCardMessages.participationRateTooltip
        )}
      />
      <Box mt="2px">
        <Text color="textPrimary" fontSize="xl" display="inline">
          {stats.participationRate.value}%
        </Text>
        {stats.participationRate.delta !== undefined && (
          <StatisticDelta
            delta={stats.participationRate.delta}
            sign={getSignNumber(stats.participationRate.delta)}
            deltaType="percentage"
          />
        )}
      </Box>
      {stats.participants.delta !== undefined && previousDays && (
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
