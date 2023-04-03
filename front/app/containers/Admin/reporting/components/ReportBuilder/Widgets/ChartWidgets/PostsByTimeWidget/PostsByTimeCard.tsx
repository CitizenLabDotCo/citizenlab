import React from 'react';

// hooks
import usePostsByTime from 'components/admin/GraphCards/PostsByTimeCard/usePostsByTime';

// components
import { Box } from '@citizenlab/cl2-component-library';
import NoData from '../../_shared/NoData';
import Chart from 'components/admin/GraphCards/PostsByTimeCard/Chart';

// i18n
import messages from '../messages';

// typings
import {
  ProjectId,
  Dates,
  Resolution,
} from 'components/admin/GraphCards/typings';

// utils
import { isNilOrError } from 'utils/helperUtils';

type Props = ProjectId & Dates & Resolution;

const PostsByTime = ({
  projectId,
  startAtMoment,
  endAtMoment,
  resolution,
}: Props) => {
  const { currentResolution, timeSeries } = usePostsByTime({
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
      id="e2e-posts-by-time-widget"
      width="100%"
      height="220px"
      mt="20px"
      pb="8px"
      px="16px"
    >
      <Box pt="8px" width="95%" height="95%" maxWidth="800px">
        <Chart
          timeSeries={timeSeries}
          startAtMoment={startAtMoment}
          endAtMoment={endAtMoment}
          resolution={currentResolution}
        />
      </Box>
    </Box>
  );
};

export default PostsByTime;
