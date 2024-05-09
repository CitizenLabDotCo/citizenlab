import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import moment from 'moment';

import useLayout from 'containers/Admin/reporting/hooks/useLayout';

import { getPreviousPeriod } from 'components/admin/GraphCards/_utils/query';
import Statistic from 'components/admin/Graphs/Statistic';

import { useIntl } from 'utils/cl-intl';

import NoData from '../../_shared/NoData';
import messages from '../messages';

import Chart from './Chart';
import { Props } from './typings';
import useActiveUsers from './useActiveUsers';

const ActiveUsers = ({
  projectId,
  startAt,
  endAt,
  resolution = 'month',
  comparePreviousPeriod,
}: Props) => {
  const { formatMessage } = useIntl();

  const { currentResolution, stats, timeSeries } = useActiveUsers({
    project_id: projectId,
    start_at: startAt,
    end_at: endAt,
    resolution,
    ...(startAt && endAt && comparePreviousPeriod
      ? getPreviousPeriod(startAt, endAt)
      : {}),
  });

  const layout = useLayout();

  if (!stats || stats.activeUsers.value === '0') {
    return <NoData message={messages.noData} />;
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
            <Statistic
              name={formatMessage(messages.totalParticipants)}
              value={stats.activeUsers.value}
              delta={stats.activeUsers.previousPeriodDelta}
              nameColor="black"
              bottomLabel={
                stats.activeUsers.previousPeriodDelta
                  ? 'compared to TODO days'
                  : undefined
              }
            />
          </Box>
        </Box>

        <Box flexGrow={1} display="flex" justifyContent="flex-end">
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
