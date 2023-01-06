import React, { useRef } from 'react';

// hooks
import useActiveUsers from 'modules/commercial/analytics/admin/components/ActiveUsersCard/useActiveUsers';

// components
import { Box, Title } from '@citizenlab/cl2-component-library';
import Chart from 'modules/commercial/analytics/admin/components/ActiveUsersCard/Chart';
import Statistic from 'components/admin/Graphs/Statistic';
import NoChartData from '../NoChartData';

// i18n
import { useIntl } from 'utils/cl-intl';
import messages from 'modules/commercial/analytics/admin/components/ActiveUsersCard/messages';

// typings
import {
  ProjectId,
  Dates,
  Resolution,
  ChartDisplay,
} from 'components/admin/GraphCards/typings';

// utils
import { isNilOrError } from 'utils/helperUtils';

type Props = ProjectId & Dates & Resolution & ChartDisplay;

const ActiveUsers = ({
  projectId,
  startAtMoment,
  endAtMoment,
  resolution,
  title,
}: Props) => {
  const { formatMessage } = useIntl();
  const graphRef = useRef();

  const { currentResolution, stats, timeSeries } = useActiveUsers({
    projectId,
    startAtMoment,
    endAtMoment,
    resolution,
  });

  if (isNilOrError(stats) || stats.activeUsers.value === '0') {
    return <NoChartData title={title} />;
  }

  return (
    <Box width="100%" height="260px" pb="20px" px="16px">
      <Title variant="h3" color="primary">
        {title}
      </Title>
      <Box height="100%" display="flex" flexDirection="row" ml="4px">
        <Box display="flex" flexDirection="row">
          <Box>
            <Statistic
              name={formatMessage(messages.totalParticipants)}
              value={stats.activeUsers.value}
            />
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

export default ActiveUsers;
