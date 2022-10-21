import React, { useRef } from 'react';

// hooks
import useVisitorsData from '../../hooks/useVisitorsData';

// components
import { Box } from '@citizenlab/cl2-component-library';
import GraphCard from 'components/admin/GraphCard';
import Chart from './Chart';
import VisitorStats from './VisitorStats';

// i18n
import { WrappedComponentProps } from 'react-intl';
import { injectIntl } from 'utils/cl-intl';
import messages from './messages';

// typings
import { IResolution } from 'components/admin/ResolutionControl';
import { Moment } from 'moment';
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
  intl: { formatMessage },
}: Props & WrappedComponentProps) => {
  const graphRef = useRef();

  const { deducedResolution, stats, timeSeries, xlsxData } = useVisitorsData(
    formatMessage,
    {
      startAtMoment,
      endAtMoment,
      projectId: projectFilter,
      resolution,
    }
  );

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
        xlsxData: isNilOrError(xlsxData) ? undefined : xlsxData,
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

export default injectIntl(VisitorsCard);
