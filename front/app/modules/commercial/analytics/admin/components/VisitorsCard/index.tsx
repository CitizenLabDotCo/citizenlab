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
import { ProjectId, Dates, Resolution } from '../../typings';
import { isNilOrError } from 'utils/helperUtils';

interface Title {
  title: string | undefined;
}
type Props = ProjectId & Dates & Resolution & Title;

const VisitorsCard = ({
  projectId,
  startAtMoment,
  endAtMoment,
  resolution,
  title,
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
        currentProjectFilter: projectId,
        resolution: deducedResolution,
      }}
    >
      <Box px="20px" width="100%" display="flex" flexDirection="row">
        <Box display="flex" flexDirection="row">
          <VisitorStats
            stats={stats}
            projectId={projectId}
            resolution={deducedResolution}
          />
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
