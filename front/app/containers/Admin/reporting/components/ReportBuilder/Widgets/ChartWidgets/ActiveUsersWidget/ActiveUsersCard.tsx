import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import moment from 'moment';

import useLayout from 'containers/Admin/reporting/hooks/useLayout';

import NoData from '../../_shared/NoData';
import chartWidgetMessages from '../messages';

import Chart from './Chart';
import Statistics from './Statistics';
import { Props } from './typings';
import useActiveUsers from './useActiveUsers';

const ActiveUsers = ({
  projectId,
  startAt,
  endAt,
  resolution = 'month',
  compareStartAt,
  compareEndAt,
  hideStatistics,
}: Props) => {
  const { currentResolution, stats, timeSeries } = useActiveUsers({
    project_id: projectId,
    start_at: startAt,
    end_at: endAt,
    resolution,
    compare_start_at: compareStartAt,
    compare_end_at: compareEndAt,
  });

  const layout = useLayout();

  if (!stats || stats.activeUsers.value === 0) {
    return <NoData message={chartWidgetMessages.noData} />;
  }

  return (
    <Box
      width="100%"
      height={layout === 'wide' ? '260px' : undefined}
      pb="8px"
      className="e2e-participants-timeline-widget"
    >
      <Box
        height="100%"
        display="flex"
        flexDirection={layout === 'wide' ? 'row' : 'column'}
      >
        {!hideStatistics && (
          <Statistics
            startAt={startAt}
            endAt={endAt}
            stats={stats}
            layout={layout}
          />
        )}

        <Box
          flexGrow={layout === 'wide' && !hideStatistics ? 1 : undefined}
          display="flex"
          justifyContent={
            layout === 'wide' && !hideStatistics ? 'flex-end' : undefined
          }
          height={layout === 'wide' ? undefined : '200px'}
          w="100%"
        >
          <Box pt="8px" width="100%" maxWidth="800px" h="100%">
            <Chart
              timeSeries={timeSeries}
              startAtMoment={startAt ? moment(startAt) : null}
              endAtMoment={endAt ? moment(endAt) : null}
              resolution={currentResolution}
              layout={layout}
              yaxis={layout === 'wide' ? undefined : { orientation: 'right' }}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default ActiveUsers;
