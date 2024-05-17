import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import moment from 'moment';

import useLayout from 'containers/Admin/reporting/hooks/useLayout';

import visitorsCardMessages from 'components/admin/GraphCards/VisitorsCard/messages';
import Statistic from 'components/admin/Graphs/Statistic';

import { useIntl } from 'utils/cl-intl';
import { isNilOrError } from 'utils/helperUtils';

import NoData from '../../../_shared/NoData';
import messages from '../../messages';
import { Props } from '../typings';
import useVisitors from '../useVisitors';

import Chart from './Chart';

// Report specific version of <VisitorsCard/>
const VisitorsCard = ({ startAt, endAt, resolution = 'month' }: Props) => {
  const { formatMessage } = useIntl();

  const { currentResolution, stats, timeSeries } = useVisitors({
    startAt,
    endAt,
    resolution,
  });

  const layout = useLayout();

  if (isNilOrError(stats) || stats.visits.value === '0') {
    return <NoData message={messages.noData} />;
  }

  return (
    <Box width="100%" height="260px" pb="8px">
      <Box
        height="100%"
        display="flex"
        flexDirection={layout === 'wide' ? 'row' : 'column'}
      >
        <Box display="flex" flexDirection="row">
          <Box
            {...(layout === 'wide'
              ? {}
              : {
                  display: 'flex',
                  flexDirection: 'row',
                  mb: '8px',
                })}
          >
            <Statistic
              name={formatMessage(visitorsCardMessages.visitors)}
              value={stats.visitors.value}
              nameColor="black"
            />
            <Box
              mt={layout === 'wide' ? '32px' : '0px'}
              ml={layout === 'wide' ? '0px' : '32px'}
            >
              <Statistic
                name={formatMessage(visitorsCardMessages.visits)}
                value={stats.visits.value}
                nameColor="black"
              />
            </Box>
          </Box>
        </Box>

        <Box flexGrow={1} display="flex" justifyContent="flex-end">
          <Box
            pt="8px"
            width={layout === 'wide' ? '95%' : '100%'}
            maxWidth="800px"
          >
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

export default VisitorsCard;
