import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import moment from 'moment';

import Chart from 'components/admin/GraphCards/VisitorsCard/Chart';
import visitorsCardMessages from 'components/admin/GraphCards/VisitorsCard/messages';
import { TimeSeries } from 'components/admin/GraphCards/VisitorsCard/useVisitors/typings';
import { IResolution } from 'components/admin/ResolutionControl';

import { formatLargeNumber, getDaysInRange } from '../../utils';
import { Stats } from '../typings';

import {
  AbsoluteStatistic,
  VisitDurationStatistic,
  PageViewsStatistic,
} from './Statistics';

export interface Props {
  startAt?: string;
  endAt?: string | null;
  currentResolution: IResolution;
  stats: Stats;
  timeSeries: TimeSeries | null;
  hideStatistics?: boolean;
}

const Wide = ({
  startAt,
  endAt,
  currentResolution,
  stats,
  timeSeries,
  hideStatistics,
}: Props) => {
  const previousDays = getDaysInRange(startAt, endAt);

  return (
    <Box
      width="100%"
      pb="8px"
      height="100%"
      display="flex"
      flexDirection="column"
    >
      {!hideStatistics && (
        <Box display="flex" flexDirection="row" justifyContent="space-between">
          <Box maxWidth="25%" pr="12px">
            <AbsoluteStatistic
              nameMessage={visitorsCardMessages.visitors}
              tooltipMessage={visitorsCardMessages.visitorsStatTooltipMessage}
              stat={stats.visitors}
              previousDays={previousDays}
            />
          </Box>
          <Box maxWidth="25%" pr="12px">
            <AbsoluteStatistic
              nameMessage={visitorsCardMessages.visits}
              tooltipMessage={visitorsCardMessages.visitsStatTooltipMessage}
              stat={stats.visits}
              previousDays={previousDays}
            />
          </Box>
          <Box maxWidth="25%" pr="12px">
            <VisitDurationStatistic
              nameMessage={visitorsCardMessages.visitDuration}
              stat={stats.visitDuration}
              previousDays={previousDays}
            />
          </Box>
          <Box maxWidth="25%" pr="12px">
            <PageViewsStatistic
              nameMessage={visitorsCardMessages.pageViews}
              stat={stats.pageViews}
              previousDays={previousDays}
            />
          </Box>
        </Box>
      )}

      <Box
        flexGrow={1}
        display="flex"
        justifyContent="flex-start"
        mt="28px"
        maxWidth="800px"
        h="240px"
      >
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
  );
};

export default Wide;
