import React, { useRef } from 'react';

// hooks
import useVisitors from '../../../../../../../modules/commercial/analytics/admin/hooks/useVisitors/';

// components
import GraphCard from 'components/admin/GraphCard';
import { Box } from '@citizenlab/cl2-component-library';
import Chart from '../../../../../../../modules/commercial/analytics/admin/components/VisitorsCard/Chart';
import Statistic from '../../../../../../../components/admin/Graphs/Statistic';

// i18n
import { useIntl } from 'utils/cl-intl';
import messages from '../../../../../../../modules/commercial/analytics/admin/components/VisitorsCard/messages';

// typings
import {
  ProjectId,
  Dates,
  Resolution,
  ChartDisplay,
} from '../../../../../../../modules/commercial/analytics/admin/typings';
import { Stats } from '../../../../../../../modules/commercial/analytics/admin/hooks/useVisitors/typings';

// utils
import { isNilOrError } from 'utils/helperUtils';

type Props = ProjectId & Dates & Resolution & ChartDisplay;

// Report specific version of <VisitorsCard/>
const VisitorsReportCard = ({
  projectId,
  startAtMoment,
  endAtMoment,
  resolution,
  title,
}: Props) => {
  const { formatMessage } = useIntl();
  const graphRef = useRef();

  const { currentResolution, stats, timeSeries } = useVisitors({
    projectId,
    startAtMoment,
    endAtMoment,
    resolution,
  });

  const cardTitle = title ? title : formatMessage(messages.visitors);

  const EMPTY_STAT = { value: '-', lastPeriod: '-' };
  const EMPTY_DATA: Stats = {
    visitors: EMPTY_STAT,
    visits: EMPTY_STAT,
    visitDuration: EMPTY_STAT,
    pageViews: EMPTY_STAT,
  };
  const shownStats = isNilOrError(stats) ? EMPTY_DATA : stats;

  return (
    <GraphCard title={cardTitle}>
      <Box px="20px" width="100%" display="flex" flexDirection="row">
        <Box display="flex" flexDirection="row">
          <Box>
            <Statistic
              name={formatMessage(messages.visitors)}
              value={shownStats.visitors.value}
            />
            <Box mt="32px">
              <Statistic
                name={formatMessage(messages.visits)}
                value={shownStats.visits.value}
              />
            </Box>
          </Box>
        </Box>

        <Box flexGrow={1} display="flex" justifyContent="flex-end">
          <Box pt="8px" width="95%" maxWidth="800px" height="250px">
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

export default VisitorsReportCard;
