import React, { useRef } from 'react';

// hooks
import useVisitors from 'components/admin/GraphCards/VisitorsCard/useVisitors';

// components
import { Box, Title } from '@citizenlab/cl2-component-library';
import Chart from 'components/admin/GraphCards/VisitorsCard/Chart';
import Statistic from 'components/admin/Graphs/Statistic';

// i18n
import { useIntl } from 'utils/cl-intl';
import messages from 'components/admin/GraphCards/VisitorsCard/messages';

// typings
import {
  ProjectId,
  Dates,
  Resolution,
  ChartDisplay,
} from 'components/admin/GraphCards/typings';
import { Stats } from 'components/admin/GraphCards/VisitorsCard/useVisitors/typings';

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

  const EMPTY_STAT = { value: '-', lastPeriod: '-' };
  const EMPTY_DATA: Stats = {
    visitors: EMPTY_STAT,
    visits: EMPTY_STAT,
    visitDuration: EMPTY_STAT,
    pageViews: EMPTY_STAT,
  };
  const shownStats = isNilOrError(stats) ? EMPTY_DATA : stats;

  return (
    <Box width="100%" height="260px" pb="20px" px="16px">
      <Title variant="h3" color="primary">
        {title}
      </Title>
      <Box height="100%" display="flex" flexDirection="row" ml="4px">
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

        <Box flexGrow={1} display="flex" justifyContent="flex-end" pb="32px">
          <Box pt="8px" width="95%" maxWidth="800px">
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
    </Box>
  );
};

export default VisitorsReportCard;
