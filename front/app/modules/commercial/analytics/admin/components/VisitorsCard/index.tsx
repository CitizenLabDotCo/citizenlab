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
import { ProjectId, Dates, Resolution, ChartDisplay } from '../../typings';
import { isNilOrError } from 'utils/helperUtils';
import VisitorStatsReport from './VisitorStatsReport';

type Props = ProjectId & Dates & Resolution & ChartDisplay;

const VisitorsCard = ({
  projectId,
  startAtMoment,
  endAtMoment,
  resolution,
  title,
  interactive = true,
}: Props) => {
  const { formatMessage } = useIntl();
  const graphRef = useRef();

  const { deducedResolution, stats, timeSeries, xlsxData } = useVisitors({
    projectId,
    startAtMoment,
    endAtMoment,
    resolution,
  });

  const cardTitle = title ? title : formatMessage(messages.visitors);
  const startAt = startAtMoment?.toISOString();
  const endAt = endAtMoment?.toISOString();

  const exportMenu = interactive
    ? {
        name: cardTitle,
        svgNode: graphRef,
        xlsx: isNilOrError(xlsxData) ? undefined : { data: xlsxData },
        startAt,
        endAt,
        currentProjectFilter: projectId,
        resolution: deducedResolution,
      }
    : undefined;

  const infoTooltipContent = interactive
    ? undefined
    : formatMessage(messages.cardTitleTooltipMessage);

  const visitorStatBox = interactive ? (
    <VisitorStatsReport stats={stats} />
  ) : (
    <VisitorStats
      stats={stats}
      projectId={projectId}
      resolution={deducedResolution}
    />
  );

  return (
    <GraphCard
      title={cardTitle}
      infoTooltipContent={infoTooltipContent}
      exportMenu={exportMenu}
    >
      <Box px="20px" width="100%" display="flex" flexDirection="row">
        <Box display="flex" flexDirection="row">
          {visitorStatBox}
        </Box>

        <Box flexGrow={1} display="flex" justifyContent="flex-end">
          <Box pt="8px" width="95%" maxWidth="800px" height="250px">
            <Chart
              timeSeries={timeSeries}
              startAtMoment={startAtMoment}
              endAtMoment={endAtMoment}
              resolution={deducedResolution}
              innerRef={graphRef}
            />
          </Box>
        </Box>
      </Box>
    </GraphCard>
  );
};

export default VisitorsCard;
