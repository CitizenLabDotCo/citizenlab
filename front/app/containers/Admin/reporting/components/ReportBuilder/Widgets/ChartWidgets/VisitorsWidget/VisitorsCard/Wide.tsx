import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import moment from 'moment';

import Chart from 'components/admin/GraphCards/VisitorsCard/Chart';
import visitorsCardMessages from 'components/admin/GraphCards/VisitorsCard/messages';
import { TimeSeries } from 'components/admin/GraphCards/VisitorsCard/useVisitors/typings';
import { IResolution } from 'components/admin/ResolutionControl';

import { formatLargeNumber } from '../../utils';
import { Stats } from '../typings';

import { AbsoluteStatistic } from './Statistics';

export interface Props {
  startAt?: string;
  endAt?: string | null;
  currentResolution: IResolution;
  stats: Stats;
  timeSeries: TimeSeries | null;
}

const Wide = ({
  startAt,
  endAt,
  currentResolution,
  stats,
  timeSeries,
}: Props) => {
  return (
    <Box height="100%" display="flex" flexDirection="row">
      <Box display="flex" flexDirection="row">
        <Box>
          <AbsoluteStatistic
            nameMessage={visitorsCardMessages.visitors}
            stat={stats.visitors}
            startAt={startAt}
            endAt={endAt}
          />
          <Box mt="32px" ml="0px">
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
        <Box pt="8px" width="95%" maxWidth="800px">
          <Chart
            timeSeries={timeSeries}
            startAtMoment={startAt ? moment(startAt) : null}
            endAtMoment={endAt ? moment(endAt) : null}
            resolution={currentResolution}
            yaxis={{
              orientation: 'left',
              tickFormatter: formatLargeNumber,
            }}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default Wide;
