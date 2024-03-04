import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import useLayout from 'containers/Admin/reporting/hooks/useLayout';

import {
  ProjectId,
  Dates,
  Resolution,
} from 'components/admin/GraphCards/typings';
import Statistic from 'components/admin/Graphs/Statistic';

import { useIntl } from 'utils/cl-intl';

import NoData from '../../_shared/NoData';
import messages from '../messages';

import Chart from './Chart';

import useActiveUsers from './useActiveUsers';

type Props = ProjectId & Dates & Resolution;

const ActiveUsers = ({
  projectId,
  startAtMoment,
  endAtMoment,
  resolution,
}: Props) => {
  const { formatMessage } = useIntl();

  const { currentResolution, stats, timeSeries } = useActiveUsers({
    projectId,
    startAtMoment,
    endAtMoment,
    resolution,
  });

  const layout = useLayout();

  if (!stats || stats.activeUsers.value === '0') {
    return <NoData message={messages.noData} />;
  }

  return (
    <Box width="100%" height="260px" mt="20px" pb="8px">
      <Box
        height="100%"
        display="flex"
        flexDirection={layout === 'wide' ? 'row' : 'column'}
      >
        <Box
          display="flex"
          flexDirection="row"
          mb={layout === 'wide' ? undefined : '8px'}
        >
          <Box>
            <Statistic
              name={formatMessage(messages.totalParticipants)}
              value={stats.activeUsers.value}
              nameColor="black"
            />
          </Box>
        </Box>

        <Box flexGrow={1} display="flex" justifyContent="flex-end">
          <Box pt="8px" width="100%" maxWidth="800px">
            <Chart
              timeSeries={timeSeries}
              startAtMoment={startAtMoment}
              endAtMoment={endAtMoment}
              resolution={currentResolution}
              layout={layout}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default ActiveUsers;
