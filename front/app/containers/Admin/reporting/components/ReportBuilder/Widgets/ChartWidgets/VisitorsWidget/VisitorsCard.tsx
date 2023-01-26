import React, { useRef } from 'react';

// hooks
import useVisitors from 'components/admin/GraphCards/VisitorsCard/useVisitors';

// components
import { Box } from '@citizenlab/cl2-component-library';
import NoData from '../../_shared/NoData';
import Chart from 'components/admin/GraphCards/VisitorsCard/Chart';
import Statistic from 'components/admin/Graphs/Statistic';

// i18n
import { useIntl } from 'utils/cl-intl';
import messages from '../messages';
import visitorsCardMessages from 'components/admin/GraphCards/VisitorsCard/messages';

// typings
import {
  ProjectId,
  Dates,
  Resolution,
} from 'components/admin/GraphCards/typings';

// utils
import { isNilOrError } from 'utils/helperUtils';

type Props = ProjectId & Dates & Resolution;

// Report specific version of <VisitorsCard/>
const VisitorsCard = ({
  projectId,
  startAtMoment,
  endAtMoment,
  resolution,
}: Props) => {
  const { formatMessage } = useIntl();
  const graphRef = useRef();

  const { currentResolution, stats, timeSeries } = useVisitors({
    projectId,
    startAtMoment,
    endAtMoment,
    resolution,
  });

  if (isNilOrError(stats) || stats.visits.value === '0') {
    return <NoData message={messages.noData} />;
  }

  return (
    <Box width="100%" height="260px" mt="20px" pb="8px" px="16px">
      <Box height="100%" display="flex" flexDirection="row" ml="4px">
        <Box display="flex" flexDirection="row">
          <Box>
            <Statistic
              name={formatMessage(visitorsCardMessages.visitors)}
              value={stats.visitors.value}
            />
            <Box mt="32px">
              <Statistic
                name={formatMessage(visitorsCardMessages.visits)}
                value={stats.visits.value}
              />
            </Box>
          </Box>
        </Box>

        <Box flexGrow={1} display="flex" justifyContent="flex-end">
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

export default VisitorsCard;
