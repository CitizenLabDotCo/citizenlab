import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';
import moment from 'moment';

import useLayout from 'containers/Admin/reporting/hooks/useLayout';

import { getComparedTimeRange } from 'components/admin/GraphCards/_utils/query';
import StatisticBottomLabel from 'components/admin/Graphs/Statistic/StatisticBottomLabel';
import StatisticDelta from 'components/admin/Graphs/Statistic/StatisticDelta';
import StatisticName from 'components/admin/Graphs/Statistic/StatisticName';

import { useIntl } from 'utils/cl-intl';

import NoData from '../../_shared/NoData';
import chartWidgetMessages from '../messages';

import Chart from './Chart';
import messages from './messages';
import { Props } from './typings';
import useActiveUsers from './useActiveUsers';

const ActiveUsers = ({
  projectId,
  startAt,
  endAt,
  resolution = 'month',
  comparePreviousPeriod = false,
}: Props) => {
  const { formatMessage } = useIntl();

  const { currentResolution, stats, timeSeries } = useActiveUsers({
    project_id: projectId,
    start_at: startAt,
    end_at: endAt,
    resolution,
    ...getComparedTimeRange(comparePreviousPeriod, startAt, endAt),
  });

  const layout = useLayout();

  if (!stats || stats.activeUsers.value === 0) {
    return <NoData message={chartWidgetMessages.noData} />;
  }

  return (
    <Box width="100%" height="260px" mt="20px" pb="8px">
      <Box
        height="100%"
        display="flex"
        flexDirection={layout === 'wide' ? 'row' : 'column'}
      >
        <Box
          display="flex"
          flexDirection="row"
          mb={layout === 'wide' ? undefined : '8px'}
        >
          <Box>
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
                    days: moment(endAt).diff(moment(startAt), 'days'),
                  })}
                />
              )}
            </Box>

            <Box mt={layout === 'wide' ? '32px' : '12px'}>
              <StatisticName
                name={formatMessage(messages.participationRate)}
                nameColor="black"
              />
              <Box mt="2px">
                <Text color="textPrimary" fontSize="xl" display="inline">
                  {stats.participationRate.value}
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
                    days: moment(endAt).diff(moment(startAt), 'days'),
                  })}
                />
              )}
            </Box>
          </Box>
        </Box>

        <Box
          flexGrow={layout === 'wide' ? 1 : undefined}
          display="flex"
          justifyContent={layout === 'wide' ? 'flex-end' : undefined}
          w={layout === 'wide' ? undefined : '100%'}
        >
          <Box pt="8px" width="100%" maxWidth="800px">
            <Chart
              timeSeries={timeSeries}
              startAtMoment={startAt ? moment(startAt) : null}
              endAtMoment={endAt ? moment(endAt) : null}
              resolution={currentResolution}
              layout={layout}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default ActiveUsers;
