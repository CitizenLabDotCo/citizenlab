import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';
import moment from 'moment';

import dashboardCardMessages from 'components/admin/GraphCards/ActiveUsersCard/messages';
import { Layout, DatesStrings } from 'components/admin/GraphCards/typings';
import StatisticBottomLabel from 'components/admin/Graphs/Statistic/StatisticBottomLabel';
import StatisticDelta from 'components/admin/Graphs/Statistic/StatisticDelta';
import StatisticName from 'components/admin/Graphs/Statistic/StatisticName';

import { useIntl } from 'utils/cl-intl';

import chartWidgetMessages from '../../messages';
import messages from '../messages';
import { parseStats } from '../useActiveUsers/parse';

interface Props extends DatesStrings {
  stats: ReturnType<typeof parseStats>;
  layout: Layout;
}

const Statistics = ({ startAt, endAt, stats, layout }: Props) => {
  const { formatMessage } = useIntl();

  const previousDays = moment(endAt).diff(moment(startAt), 'days');

  return (
    <Box mb={layout === 'wide' ? undefined : '8px'}>
      <Box>
        <StatisticName
          name={formatMessage(chartWidgetMessages.totalParticipants)}
          nameColor="black"
        />
        <Box mt="2px">
          <Text color="textPrimary" fontSize="xl" display="inline">
            {stats.activeUsers.value}
          </Text>
          {stats.activeUsers.delta !== undefined && (
            <StatisticDelta delta={stats.activeUsers.delta} />
          )}
        </Box>
        {stats.activeUsers.delta !== undefined && (
          <StatisticBottomLabel
            bottomLabel={formatMessage(messages.comparedToPreviousXDays, {
              days: previousDays,
            })}
          />
        )}
      </Box>

      <Box mt={layout === 'wide' ? '32px' : '12px'}>
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
              deltaType="percentage"
            />
          )}
        </Box>
        {stats.activeUsers.delta !== undefined && (
          <StatisticBottomLabel
            bottomLabel={formatMessage(messages.comparedToPreviousXDays, {
              days: previousDays,
            })}
          />
        )}
      </Box>
    </Box>
  );
};

export default Statistics;
