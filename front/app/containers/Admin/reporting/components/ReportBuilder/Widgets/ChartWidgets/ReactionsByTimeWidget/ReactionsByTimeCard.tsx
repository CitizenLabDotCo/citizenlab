import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import Chart from 'components/admin/GraphCards/ReactionsByTimeCard/Chart';
import {
  ProjectId,
  Dates,
  Resolution,
} from 'components/admin/GraphCards/typings';

import { isNilOrError } from 'utils/helperUtils';

import NoData from '../../_shared/NoData';
import messages from '../messages';

import useReactionsByTime from './useReactionsByTime';

type Props = ProjectId & Dates & Resolution;

const ReactionsByTime = ({
  projectId,
  startAtMoment,
  endAtMoment,
  resolution,
}: Props) => {
  const { currentResolution, timeSeries } = useReactionsByTime({
    projectId,
    startAtMoment,
    endAtMoment,
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
        startAtMoment={startAtMoment}
        endAtMoment={endAtMoment}
        resolution={currentResolution}
      />
    </Box>
  );
};

export default ReactionsByTime;
