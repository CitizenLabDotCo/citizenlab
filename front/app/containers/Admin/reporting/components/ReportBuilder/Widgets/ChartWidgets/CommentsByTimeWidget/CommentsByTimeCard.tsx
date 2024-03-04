import React from 'react';

import useCommentsByTime from './useCommentsByTime';

import { Box } from '@citizenlab/cl2-component-library';
import NoData from '../../_shared/NoData';
import Chart from 'components/admin/GraphCards/CommentsByTimeCard/Chart';

import messages from '../messages';

import {
  ProjectId,
  Dates,
  Resolution,
} from 'components/admin/GraphCards/typings';

import { isNilOrError } from 'utils/helperUtils';

type Props = ProjectId & Dates & Resolution;

const CommentsByTime = ({
  projectId,
  startAtMoment,
  endAtMoment,
  resolution,
}: Props) => {
  const { currentResolution, timeSeries } = useCommentsByTime({
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
      id="e2e-comments-by-time-widget"
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

export default CommentsByTime;
