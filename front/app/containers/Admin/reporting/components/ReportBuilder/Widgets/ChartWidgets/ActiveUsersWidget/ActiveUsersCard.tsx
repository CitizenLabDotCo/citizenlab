import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import moment from 'moment';

import useLayout from 'containers/Admin/reporting/hooks/useLayout';

import {
  ProjectId,
  DatesStrings,
  Resolution,
} from 'components/admin/GraphCards/typings';
import Statistic from 'components/admin/Graphs/Statistic';

import { useIntl } from 'utils/cl-intl';

import NoData from '../../_shared/NoData';
import messages from '../messages';

import Chart from './Chart';
import useActiveUsers from './useActiveUsers';

type Props = ProjectId & DatesStrings & Resolution;

const ActiveUsers = ({ projectId, startAt, endAt, resolution }: Props) => {
  const { formatMessage } = useIntl();

  const { currentResolution, stats, timeSeries } = useActiveUsers({
    projectId,
    startAt,
    endAt,
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
              startAtMoment={startAt ? moment(startAt) : null}
              endAtMoment={endAt ? moment(endAt) : null}
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
