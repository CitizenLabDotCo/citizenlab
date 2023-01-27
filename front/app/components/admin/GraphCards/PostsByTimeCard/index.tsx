import React, { useRef } from 'react';

// hooks
import usePostsByTime from './usePostsByTime';

// components
import GraphCard from 'components/admin/GraphCard';
import { Box } from '@citizenlab/cl2-component-library';
import Title from './Title';
import Chart from './Chart';

// i18n
import messages from 'containers/Admin/dashboard/messages';
import { useIntl } from 'utils/cl-intl';

// utils
import { isNilOrError, NilOrError } from 'utils/helperUtils';

// typings
import {
  ProjectId,
  Dates,
  Resolution,
} from 'components/admin/GraphCards/typings';
import { TimeSeries } from './usePostsByTime/typings';

type Props = ProjectId & Dates & Resolution;

const formatSerieChange = (serieChange: number) => {
  if (serieChange > 0) {
    return `(+${serieChange.toString()})`;
  } else if (serieChange < 0) {
    return `(${serieChange.toString()})`;
  }
  return null;
};

const getFormattedNumbers = (
  serie: TimeSeries | NilOrError
): {
  typeOfChange: 'increase' | 'decrease' | null;
  totalNumber: number | null;
  formattedSerieChange: string | null;
} => {
  if (!isNilOrError(serie)) {
    const firstSerieValue = serie && serie[0].total;
    const lastSerieValue = serie && serie[serie.length - 1].total;
    const serieChange = lastSerieValue - firstSerieValue;
    let typeOfChange: 'increase' | 'decrease' | null = null;

    if (serieChange > 0) {
      typeOfChange = 'increase';
    } else if (serieChange < 0) {
      typeOfChange = 'decrease';
    }

    return {
      typeOfChange,
      totalNumber: lastSerieValue,
      formattedSerieChange: formatSerieChange(serieChange),
    };
  }

  return {
    totalNumber: null,
    formattedSerieChange: null,
    typeOfChange: null,
  };
};

const PostByTimeCard = ({
  projectId,
  startAtMoment,
  endAtMoment,
  resolution,
}: Props) => {
  const { formatMessage } = useIntl();
  const graphRef = useRef();
  const { timeSeries, xlsxData, currentResolution } = usePostsByTime({
    startAtMoment,
    endAtMoment,
    resolution,
  });

  const cardTitle = formatMessage(messages.inputs);
  const startAt = startAtMoment?.toISOString();
  const endAt = endAtMoment?.toISOString();

  return (
    <GraphCard
      title={<Title title={cardTitle} {...getFormattedNumbers(timeSeries)} />}
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
              projectId={projectId}
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
