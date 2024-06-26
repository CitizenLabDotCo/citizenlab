import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import moment from 'moment';

import Chart from 'components/admin/GraphCards/VisitorsCard/Chart';
import visitorsCardMessages from 'components/admin/GraphCards/VisitorsCard/messages';

import { formatLargeNumber, getDaysInRange } from '../../utils';

import {
  AbsoluteStatistic,
  OtherStatistic,
  getDurationDeltaSign,
  getPageViewsDeltaSign,
} from './Statistics';
import { Props } from './Wide';

const Narrow = ({
  startAt,
  endAt,
  currentResolution,
  stats,
  timeSeries,
  hideStatistics,
}: Props) => {
  const previousDays = getDaysInRange(startAt, endAt);

  return (
    <Box height="100%" display="flex" flexDirection="column">
      {!hideStatistics && (
        <Box display="flex" flexDirection="column" mb="8px">
          <AbsoluteStatistic
            nameMessage={visitorsCardMessages.visitors}
            tooltipMessage={visitorsCardMessages.visitorsStatTooltipMessage}
            stat={stats.visitors}
            previousDays={previousDays}
          />
          <Box mt="12px">
            <AbsoluteStatistic
              nameMessage={visitorsCardMessages.visits}
              tooltipMessage={visitorsCardMessages.visitsStatTooltipMessage}
              stat={stats.visits}
              previousDays={previousDays}
            />
          </Box>
          <Box mt="12px">
            <OtherStatistic
              nameMessage={visitorsCardMessages.visitDuration}
              stat={stats.visitDuration}
              previousDays={previousDays}
              sign={getDurationDeltaSign(stats.visitDuration.delta)}
            />
          </Box>
          <Box mt="12px">
            <OtherStatistic
              nameMessage={visitorsCardMessages.pageViews}
              stat={stats.pageViews}
              previousDays={previousDays}
              sign={getPageViewsDeltaSign(stats.pageViews.delta)}
            />
          </Box>
        </Box>
      )}
      <Box pt="8px" width="100%" h="200px">
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
  );
};

export default Narrow;
