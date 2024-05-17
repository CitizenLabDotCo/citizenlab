import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import moment from 'moment';

import Chart from 'components/admin/GraphCards/VisitorsCard/Chart';
import visitorsCardMessages from 'components/admin/GraphCards/VisitorsCard/messages';

import { formatLargeNumber } from '../../utils';

import { AbsoluteStatistic } from './Statistics';
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
      <Box display="flex" flexDirection="row">
        <Box display="flex" flexDirection="row" mb="8px">
          <AbsoluteStatistic
            nameMessage={visitorsCardMessages.visitors}
            stat={stats.visitors}
            startAt={startAt}
            endAt={endAt}
          />
          <Box mt="0px" ml="32px">
            <AbsoluteStatistic
              nameMessage={visitorsCardMessages.visits}
              stat={stats.visits}
              startAt={startAt}
              endAt={endAt}
            />
          </Box>
        </Box>
      </Box>

      <Box flexGrow={1} display="flex" justifyContent="flex-end">
        <Box pt="8px" width="100%" maxWidth="800px">
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
