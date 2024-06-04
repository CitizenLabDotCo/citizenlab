import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import moment from 'moment';

import Chart from 'components/admin/GraphCards/ParticipantsCard/Chart';
import { TimeSeries } from 'components/admin/GraphCards/ParticipantsCard/useParticipants/typings';
import { DatesStrings } from 'components/admin/GraphCards/typings';
import { IResolution } from 'components/admin/ResolutionControl';

import { getDaysInRange } from '../../utils';
import { Stats } from '../typings';

import {
  ParticipantsStatistic,
  ParticipationRateStatistic,
} from './Statistics';

export interface Props extends DatesStrings {
  timeSeries: TimeSeries | null;
  hideStatistics: boolean;
  stats: Stats;
  currentResolution: IResolution;
}

const Wide = ({
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
      width="100%"
      height="260px"
      pb="8px"
      className="e2e-participants-timeline-widget"
      display="flex"
      flexDirection="row"
    >
      {!hideStatistics && (
        <Box>
          <ParticipantsStatistic stats={stats} previousDays={previousDays} />
          <Box mt="32px">
            <ParticipationRateStatistic
              stats={stats}
              previousDays={previousDays}
            />
          </Box>
        </Box>
      )}
      <Box
        flexGrow={1}
        display="flex"
        justifyContent={hideStatistics ? 'flex-start' : 'flex-end'}
        pt="8px"
        maxWidth="800px"
        h="100%"
      >
        <Chart
          timeSeries={timeSeries}
          startAtMoment={startAt ? moment(startAt) : null}
          endAtMoment={endAt ? moment(endAt) : null}
          resolution={currentResolution}
          yaxis={hideStatistics ? { orientation: 'right' } : undefined}
          margin={
            hideStatistics
              ? { top: 0, right: -16, bottom: 0, left: 0 }
              : undefined
          }
        />
      </Box>
    </Box>
  );
};

export default Wide;
