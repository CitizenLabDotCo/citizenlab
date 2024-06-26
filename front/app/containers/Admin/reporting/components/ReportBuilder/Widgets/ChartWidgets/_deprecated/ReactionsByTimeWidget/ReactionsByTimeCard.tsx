import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import moment from 'moment';

import Chart from 'components/admin/GraphCards/ReactionsByTimeCard/Chart';

import { isNilOrError } from 'utils/helperUtils';

import NoData from '../../../_shared/NoData';
import messages from '../../messages';
import { TimeSeriesWidgetProps } from '../../typings';

import useReactionsByTime from './useReactionsByTime';

const ReactionsByTime = ({
  projectId,
  startAt,
  endAt,
  resolution = 'month',
}: TimeSeriesWidgetProps) => {
  const { currentResolution, timeSeries } = useReactionsByTime({
    projectId,
    startAt,
    endAt,
    resolution,
  });

  if (isNilOrError(timeSeries)) {
    return <NoData message={messages.noData} />;
  }

  return (
    <Box
      id="e2e-reactions-by-time-widget"
      width="100%"
      height="220px"
      mt="20px"
      pb="8px"
    >
      <Chart
        timeSeries={timeSeries}
        startAtMoment={startAt ? moment(startAt) : null}
        endAtMoment={endAt ? moment(endAt) : null}
        resolution={currentResolution}
      />
    </Box>
  );
};

export default ReactionsByTime;
