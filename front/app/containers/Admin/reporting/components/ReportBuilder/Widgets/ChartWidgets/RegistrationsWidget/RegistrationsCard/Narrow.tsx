import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import moment from 'moment';

import Chart from 'components/admin/GraphCards/RegistrationsCard/Chart';

import {
  RegistrationsStatistic,
  RegistrationRateStatistic,
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
  return (
    <Box width="100%" pb="8px" className="e2e-participants-timeline-widget">
      <Box height="100%" display="flex" flexDirection="column">
        {!hideStatistics && (
          <Box mb="8px">
            <RegistrationsStatistic
              stats={stats}
              startAt={startAt}
              endAt={endAt}
            />
            <Box mt="12px">
              <RegistrationRateStatistic
                stats={stats}
                startAt={startAt}
                endAt={endAt}
              />
            </Box>
          </Box>
        )}

        <Box display="flex" height="200px" w="100%">
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
              yaxis={{ orientation: 'right' }}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Narrow;
