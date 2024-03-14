import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import moment from 'moment';

import Chart from 'components/admin/GraphCards/ReactionsByTimeCard/Chart';
import {
  ProjectId,
  DatesStrings,
  Resolution,
} from 'components/admin/GraphCards/typings';

import { isNilOrError } from 'utils/helperUtils';

import NoData from '../../_shared/NoData';
import messages from '../messages';

import useReactionsByTime from './useReactionsByTime';

type Props = ProjectId & DatesStrings & Resolution;

const ReactionsByTime = ({ projectId, startAt, endAt, resolution }: Props) => {
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
        startAtMoment={moment(startAt)}
        endAtMoment={moment(endAt)}
        resolution={currentResolution}
      />
    </Box>
  );
};

export default ReactionsByTime;
