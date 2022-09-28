import React, { useRef } from 'react';

// hooks
import useVisitorsData from '../../hooks/useVisitorsData';

// components
import GraphCard from 'components/admin/GraphCard';
import { Box } from '@citizenlab/cl2-component-library';
import VisitorStats from './VisitorStats';
import Chart from './Chart';

// i18n
import messages from './messages';
import { injectIntl } from 'utils/cl-intl';
import { InjectedIntlProps } from 'react-intl';

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
}: Props & InjectedIntlProps) => {
  const graphRef = useRef();

  const { deducedResolution, stats, timeSeries, xlsxData } = useVisitorsData({
    startAtMoment,
    endAtMoment,
    projectId: projectFilter,
    resolution,
  });

  const visitorsMessage = formatMessage(messages.visitors);
  const startAt = startAtMoment?.toISOString();
  const endAt = endAtMoment?.toISOString();

  return (
    <GraphCard
      title={visitorsMessage}
      infoTooltipContent={formatMessage(messages.cardTitleTooltipMessage)}
      exportMenu={{
        name: visitorsMessage,
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
          <VisitorStats stats={stats} resolution={deducedResolution} />
        </Box>

        <Box flexGrow={1} display="flex" justifyContent="center">
          <Chart
            timeSeries={timeSeries}
            resolution={deducedResolution}
            innerRef={graphRef}
          />
        </Box>
      </Box>
    </GraphCard>
  );
};

export default injectIntl(VisitorsCard);
