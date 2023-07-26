import React, { useRef } from 'react';

// hooks
import useReactionsByTime from './useReactionsByTime';

// components
import GraphCard from 'components/admin/GraphCard';
import { Box } from '@citizenlab/cl2-component-library';
import Chart from './Chart';
import Title from '../_components/Title';

// i18n
import messages from 'containers/Admin/dashboard/messages';
import { useIntl } from 'utils/cl-intl';

// utils
import { isNilOrError } from 'utils/helperUtils';

// typings
import {
  ProjectId,
  Dates,
  Resolution,
} from 'components/admin/GraphCards/typings';

type Props = ProjectId & Dates & Resolution;

const ReactionsByTimeCard = ({
  projectId,
  startAtMoment,
  endAtMoment,
  resolution,
}: Props) => {
  const { formatMessage } = useIntl();
  const graphRef = useRef();
  const { timeSeries, xlsxData, currentResolution, formattedNumbers } =
    useReactionsByTime({
      projectId,
      startAtMoment,
      endAtMoment,
      resolution,
    });

  const cardTitle = formatMessage(messages.reactions);
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
      <Box display="flex" id="e2e-reactions-chart">
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

export default ReactionsByTimeCard;
