import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import moment from 'moment';

import Chart from 'components/admin/GraphCards/ParticipantsCard/Chart';

import { getDaysInRange } from '../../utils';

import {
  ParticipantsStatistic,
  ParticipationRateStatistic,
} from './Statistics';
import { Props } from './Wide';

const Narrow = ({
  startAt,
  endAt,
  hideStatistics,
  timeSeries,
  stats,
  currentResolution,
}: Props) => {
  const previousDays = getDaysInRange(startAt, endAt);

  return (
    <Box
      w="100%"
      h="100%"
      pb="8px"
      className="e2e-participants-timeline-widget"
      display="flex"
      flexDirection="column"
    >
      {!hideStatistics && (
        <Box mb="8px">
          <ParticipantsStatistic stats={stats} previousDays={previousDays} />
          <Box mt="12px">
            <ParticipationRateStatistic
              stats={stats}
              previousDays={previousDays}
            />
          </Box>
        </Box>
      )}
      <Box display="flex" w="100%" h="200px" mt="8px">
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
          yaxis={{ orientation: 'right' }}
        />
      </Box>
    </Box>
  );
};

export default Narrow;
