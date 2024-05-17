import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import useLayout from 'containers/Admin/reporting/hooks/useLayout';

import { isNilOrError } from 'utils/helperUtils';

import NoData from '../../../_shared/NoData';
import messages from '../../messages';
import { Props } from '../typings';
import useVisitors from '../useVisitors';

import Narrow from './Narrow';
import Wide from './Wide';

// Report specific version of <VisitorsCard/>
const VisitorsCard = ({ startAt, endAt, resolution = 'month' }: Props) => {
  const { currentResolution, stats, timeSeries } = useVisitors({
    startAt,
    endAt,
    resolution,
  });

  const layout = useLayout();

  if (isNilOrError(stats) || stats.visits.value === '0') {
    return <NoData message={messages.noData} />;
  }

  return (
    <Box width="100%" height="260px" pb="8px">
      {layout === 'wide' ? (
        <Wide
          startAt={startAt}
          endAt={endAt}
          currentResolution={currentResolution}
          stats={stats}
          timeSeries={timeSeries}
        />
      ) : (
        <Narrow
          startAt={startAt}
          endAt={endAt}
          currentResolution={currentResolution}
          stats={stats}
          timeSeries={timeSeries}
        />
      )}
    </Box>
  );
};

export default VisitorsCard;
