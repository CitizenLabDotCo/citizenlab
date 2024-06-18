import React, { useRef } from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import messages from 'containers/Admin/dashboard/messages';

import GraphCard from 'components/admin/GraphCard';
import {
  ProjectId,
  Dates,
  Resolution,
} from 'components/admin/GraphCards/typings';

import { useIntl } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';

import Title from '../_components/Title';

import Chart from './Chart';
import usePostsByTime from './useInputsByTime';

type Props = ProjectId & Dates & Resolution;

const PostByTimeCard = ({
  projectId,
  startAtMoment,
  endAtMoment,
  resolution,
}: Props) => {
  const { formatMessage } = useIntl();
  const graphRef = useRef();
  const { timeSeries, xlsxData, currentResolution, formattedNumbers } =
    usePostsByTime({
      projectId,
      startAtMoment,
      endAtMoment,
      resolution,
    });

  const cardTitle = formatMessage(messages.inputs);
  const startAt = startAtMoment?.toISOString();
  const endAt = endAtMoment?.toISOString();

  return (
    <GraphCard
      title={<Title title={cardTitle} {...formattedNumbers} />}
      exportMenu={{
        name: cardTitle,
        svgNode: graphRef,
        xlsx: !isNilOrError(xlsxData) ? { data: xlsxData } : undefined,
        startAt,
        endAt,
        resolution: currentResolution,
      }}
    >
      <Box display="flex" id="e2e-ideas-chart">
        <Box flexGrow={1} display="flex" justifyContent="flex-end">
          <Box pt="8px" height="200px" width="100%" maxWidth="800px" mt="-1px">
            <Chart
              timeSeries={timeSeries}
              startAtMoment={startAtMoment}
              endAtMoment={endAtMoment}
              resolution={currentResolution}
              innerRef={graphRef}
            />
          </Box>
        </Box>
      </Box>
    </GraphCard>
  );
};

export default PostByTimeCard;
