import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import moment from 'moment';

import Chart from 'components/admin/GraphCards/VisitorsCard/Chart';
import visitorsCardMessages from 'components/admin/GraphCards/VisitorsCard/messages';
import Statistic from 'components/admin/Graphs/Statistic';

import { useIntl } from 'utils/cl-intl';

import { formatLargeNumber } from '../../utils';

import { Props } from './Wide';

const Narrow = ({
  startAt,
  endAt,
  currentResolution,
  stats,
  timeSeries,
}: Props) => {
  const { formatMessage } = useIntl();

  return (
    <Box height="100%" display="flex" flexDirection="column">
      <Box display="flex" flexDirection="row">
        <Box display="flex" flexDirection="row" mb="8px">
          <Statistic
            name={formatMessage(visitorsCardMessages.visitors)}
            value={stats.visitors.value}
            nameColor="black"
          />
          <Box mt="0px" ml="32px">
            <Statistic
              name={formatMessage(visitorsCardMessages.visits)}
              value={stats.visits.value}
              nameColor="black"
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
