import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import moment from 'moment';

import Chart from 'components/admin/GraphCards/RegistrationsCard/Chart';
import { TimeSeries } from 'components/admin/GraphCards/RegistrationsCard/useRegistrations/typings';
import { DatesStrings } from 'components/admin/GraphCards/typings';
import { IResolution } from 'components/admin/ResolutionControl';

import { Stats } from '../typings';

import {
  RegistrationRateStatistic,
  RegistrationsStatistic,
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
  timeSeries,
  hideStatistics,
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
          <Box>
            <RegistrationsStatistic
              stats={stats}
              startAt={startAt}
              endAt={endAt}
            />
            <Box mt="32px">
              <RegistrationRateStatistic
                stats={stats}
                startAt={startAt}
                endAt={endAt}
              />
            </Box>
          </Box>
        )}

        <Box flexGrow={1} display="flex" justifyContent="flex-end">
          <Box pt="8px" width="100%" maxWidth="800px" h="100%">
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
      </Box>
    </Box>
  );
};

export default Wide;
