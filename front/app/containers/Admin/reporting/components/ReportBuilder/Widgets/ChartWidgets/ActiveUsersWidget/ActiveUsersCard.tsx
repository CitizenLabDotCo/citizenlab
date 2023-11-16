import React from 'react';

// hooks
import useActiveUsers from './useActiveUsers';
import useLayout from 'containers/Admin/reporting/hooks/useLayout';

// components
import { Box } from '@citizenlab/cl2-component-library';
import NoData from '../../_shared/NoData';
import Chart from 'components/admin/GraphCards/ActiveUsersCard/Chart';
import Statistic from 'components/admin/Graphs/Statistic';

// i18n
import { useIntl } from 'utils/cl-intl';
import messages from '../messages';

// typings
import {
  ProjectId,
  Dates,
  Resolution,
} from 'components/admin/GraphCards/typings';

// utils
import { isNilOrError } from 'utils/helperUtils';
import { DEFAULT_PADDING } from 'components/admin/ContentBuilder/constants';

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

  if (isNilOrError(stats) || stats.activeUsers.value === '0') {
    return <NoData message={messages.noData} />;
  }

  return (
    <Box
      width="100%"
      height="260px"
      mt="20px"
      pb="8px"
      px={layout === 'wide' ? PX : '0px'}
    >
      <Box
        height="100%"
        display="flex"
        flexDirection={layout === 'wide' ? 'row' : 'column'}
      >
        <Box
          display="flex"
          flexDirection="row"
          ml={layout === 'wide' ? undefined : PX}
          mb={layout === 'wide' ? undefined : '8px'}
        >
          <Box>
            <Statistic
              name={formatMessage(messages.totalParticipants)}
              value={stats.activeUsers.value}
            />
          </Box>
        </Box>

        <Box flexGrow={1} display="flex" justifyContent="flex-end">
          <Box
            pt="8px"
            width="100%"
            maxWidth="800px"
            ml={layout === 'wide' ? undefined : '8px'}
          >
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
