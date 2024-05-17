import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import moment from 'moment';

import visitorsCardMessages from 'components/admin/GraphCards/VisitorsCard/messages';
import Statistic from 'components/admin/Graphs/Statistic';

import { useIntl } from 'utils/cl-intl';

import Chart from './Chart';

const Wide = () => {
  const { formatMessage } = useIntl();

  return (
    <Box height="100%" display="flex" flexDirection="row">
      <Box display="flex" flexDirection="row">
        <Box>
          <Statistic
            name={formatMessage(visitorsCardMessages.visitors)}
            value={stats.visitors.value}
            nameColor="black"
          />
          <Box
            mt={layout === 'wide' ? '32px' : '0px'}
            ml={layout === 'wide' ? '0px' : '32px'}
          >
            <Statistic
              name={formatMessage(visitorsCardMessages.visits)}
              value={stats.visits.value}
              nameColor="black"
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
            layout={layout}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default Wide;
