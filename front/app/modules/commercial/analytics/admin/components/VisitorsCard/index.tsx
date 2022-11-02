import React, { useRef } from 'react';

// hooks
import useVisitors from '../../hooks/useVisitors';

// components
import GraphCard from 'components/admin/GraphCard';
import { Box } from '@citizenlab/cl2-component-library';
import VisitorStats from './VisitorStats';
import Chart from './Chart';

// i18n
import messages from './messages';
import { useIntl } from 'utils/cl-intl';

// typings
import { Moment } from 'moment';
import { IResolution } from 'components/admin/ResolutionControl';
import { isNilOrError } from 'utils/helperUtils';

interface Props {
  startAtMoment: Moment | null | undefined;
  endAtMoment: Moment | null;
  projectFilter: string | undefined;
  resolution: IResolution;
}

const VisitorsCard = ({
  startAtMoment,
  endAtMoment,
  projectFilter,
  resolution,
}: Props) => {
  const { formatMessage } = useIntl();
  const graphRef = useRef();

  const { deducedResolution, stats, timeSeries, xlsxData } = useVisitors({
    startAtMoment,
    endAtMoment,
    projectId: projectFilter,
    resolution,
  });

  const cardTitle = formatMessage(messages.visitors);
  const startAt = startAtMoment?.toISOString();
  const endAt = endAtMoment?.toISOString();

  return (
    <GraphCard
      title={cardTitle}
      infoTooltipContent={formatMessage(messages.cardTitleTooltipMessage)}
      exportMenu={{
        name: cardTitle,
        svgNode: graphRef,
        xlsx: isNilOrError(xlsxData) ? undefined : { data: xlsxData },
        startAt,
        endAt,
        currentProjectFilter: projectFilter,
        resolution: deducedResolution,
      }}
    >
      <Box width="100%" display="flex" flexDirection="row">
        <Box display="flex" flexDirection="row" pl="20px">
          <VisitorStats
            stats={stats}
            projectFilter={projectFilter}
            resolution={deducedResolution}
          />
        </Box>

        <Box flexGrow={1} display="flex" justifyContent="center">
          <Chart
            timeSeries={timeSeries}
            startAtMoment={startAtMoment}
            endAtMoment={endAtMoment}
            resolution={deducedResolution}
            innerRef={graphRef}
          />
        </Box>
      </Box>
    </GraphCard>
  );
};

export default VisitorsCard;
