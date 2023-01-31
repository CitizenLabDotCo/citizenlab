import React, { useRef } from 'react';

// hooks
import useCommentsByTime from './useCommentsByTime';

// components
import GraphCard from 'components/admin/GraphCard';
import { Box } from '@citizenlab/cl2-component-library';
import Chart from './Chart';
import {
  GraphCardFigureContainer,
  GraphCardFigure,
  GraphCardFigureChange,
} from 'components/admin/GraphWrappers';

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

const CommentsByTimeCard = ({
  projectId,
  startAtMoment,
  endAtMoment,
  resolution,
}: Props) => {
  const { formatMessage } = useIntl();
  const graphRef = useRef();
  const { timeSeries, xlsxData, currentResolution, formattedNumbers } =
    useCommentsByTime({
      projectId,
      startAtMoment,
      endAtMoment,
      resolution,
    });

  const cardTitle = formatMessage(messages.comments);
  const startAt = startAtMoment?.toISOString();
  const endAt = endAtMoment?.toISOString();

  const { totalNumber, formattedSerieChange, typeOfChange } = formattedNumbers;

  return (
    <GraphCard
      title={
        <>
          {cardTitle}
          <GraphCardFigureContainer>
            <GraphCardFigure>{totalNumber}</GraphCardFigure>
            <GraphCardFigureChange className={typeOfChange}>
              {formattedSerieChange}
            </GraphCardFigureChange>
          </GraphCardFigureContainer>
        </>
      }
      exportMenu={{
        name: cardTitle,
        svgNode: graphRef,
        xlsx: !isNilOrError(xlsxData) ? { data: xlsxData } : undefined,
        startAt,
        endAt,
        resolution: currentResolution,
      }}
    >
      <Box display="flex">
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

export default CommentsByTimeCard;
