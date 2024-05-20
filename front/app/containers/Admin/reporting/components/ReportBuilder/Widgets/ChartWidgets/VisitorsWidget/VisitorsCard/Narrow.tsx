import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import moment from 'moment';

import Chart from 'components/admin/GraphCards/VisitorsCard/Chart';
import visitorsCardMessages from 'components/admin/GraphCards/VisitorsCard/messages';

import { formatLargeNumber } from '../../utils';

import {
  AbsoluteStatistic,
  VisitDurationStatistic,
  PageViewsStatistic,
} from './Statistics';
import { Props } from './Wide';

const Narrow = ({
  startAt,
  endAt,
  currentResolution,
  stats,
  timeSeries,
}: Props) => {
  return (
    <Box height="100%" display="flex" flexDirection="column">
      <Box display="flex" flexDirection="column" mb="8px">
        <AbsoluteStatistic
          nameMessage={visitorsCardMessages.visitors}
          stat={stats.visitors}
          startAt={startAt}
          endAt={endAt}
        />
        <Box mt="12px">
          <AbsoluteStatistic
            nameMessage={visitorsCardMessages.visits}
            stat={stats.visits}
            startAt={startAt}
            endAt={endAt}
          />
        </Box>
        <Box mt="12px">
          <VisitDurationStatistic
            nameMessage={visitorsCardMessages.visitDuration}
            stat={stats.visitDuration}
            startAt={startAt}
            endAt={endAt}
          />
        </Box>
        <Box mt="12px">
          <PageViewsStatistic
            nameMessage={visitorsCardMessages.pageViews}
            stat={stats.pageViews}
            startAt={startAt}
            endAt={endAt}
          />
        </Box>
      </Box>

      <Box flexGrow={1} display="flex" justifyContent="flex-end" height="200px">
        <Box pt="8px" width="100%" maxWidth="800px" h="100%">
          <Chart
            timeSeries={timeSeries}
            startAtMoment={startAt ? moment(startAt) : null}
            endAtMoment={endAt ? moment(endAt) : null}
            resolution={currentResolution}
            margin={{
              left: 5,
              right: -20,
              top: 0,
              bottom: 0,
            }}
            yaxis={{
              orientation: 'right',
              tickFormatter: formatLargeNumber,
            }}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default Narrow;
