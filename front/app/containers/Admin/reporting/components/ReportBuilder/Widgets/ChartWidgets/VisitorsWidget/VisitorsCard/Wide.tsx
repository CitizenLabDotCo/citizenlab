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
    <Box width="100%" pb="8px">
      <Box height="100%" display="flex" flexDirection="column">
        <Box display="flex" flexDirection="row">
          <AbsoluteStatistic
            nameMessage={visitorsCardMessages.visitors}
            stat={stats.visitors}
            startAt={startAt}
            endAt={endAt}
          />
          <Box ml="12px">
            <AbsoluteStatistic
              nameMessage={visitorsCardMessages.visits}
              stat={stats.visits}
              startAt={startAt}
              endAt={endAt}
            />
          </Box>
          <Box ml="12px">
            <AbsoluteStatistic
              nameMessage={visitorsCardMessages.visitors}
              stat={stats.visitors}
              startAt={startAt}
              endAt={endAt}
            />
          </Box>
          <Box ml="12px">
            <AbsoluteStatistic
              nameMessage={visitorsCardMessages.visits}
              stat={stats.visits}
              startAt={startAt}
              endAt={endAt}
            />
          </Box>
        </Box>

        <Box flexGrow={1} display="flex" justifyContent="flex-start" mt="20px">
          <Box pt="8px" w="100%" maxWidth="800px" h="240px">
            <Chart
              timeSeries={timeSeries}
              startAtMoment={startAt ? moment(startAt) : null}
              endAtMoment={endAt ? moment(endAt) : null}
              resolution={currentResolution}
              yaxis={{
                orientation: 'right',
                tickFormatter: formatLargeNumber,
              }}
              margin={{ top: 0, right: -16, bottom: 0, left: 0 }}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Wide;
