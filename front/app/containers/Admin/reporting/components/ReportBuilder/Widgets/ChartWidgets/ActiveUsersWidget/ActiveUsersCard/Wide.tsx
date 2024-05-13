import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import moment from 'moment';

import Chart from 'components/admin/GraphCards/ActiveUsersCard/Chart';
import { TimeSeries } from 'components/admin/GraphCards/ActiveUsersCard/useActiveUsers/typings';
import { DatesStrings } from 'components/admin/GraphCards/typings';
import { IResolution } from 'components/admin/ResolutionControl';

import { parseStats } from '../useActiveUsers/parse';

import Statistics from './Statistics';

export interface Props extends DatesStrings {
  timeSeries: TimeSeries | null;
  hideStatistics: boolean;
  stats: ReturnType<typeof parseStats>;
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
  return (
    <Box
      width="100%"
      height="260px"
      pb="8px"
      className="e2e-participants-timeline-widget"
    >
      <Box height="100%" display="flex" flexDirection="row">
        {!hideStatistics && (
          <Statistics
            startAt={startAt}
            endAt={endAt}
            stats={stats}
            layout="wide"
          />
        )}

        <Box flexGrow={1} display="flex" justifyContent="flex-end">
          <Box pt="8px" width="100%" maxWidth="800px" h="100%">
            <Chart
              timeSeries={timeSeries}
              startAtMoment={startAt ? moment(startAt) : null}
              endAtMoment={endAt ? moment(endAt) : null}
              resolution={currentResolution}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Wide;
