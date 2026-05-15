import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import moment from 'moment';

import Chart from 'components/admin/GraphCards/InternalAdoptionCard/Chart';
import { AccessibilityProps } from 'components/admin/Graphs/typings';

import { useIntl } from 'utils/cl-intl';

import NoData from '../../../_shared/NoData';
import A11yTable from '../../_shared/A11yTable';
import chartWidgetMessages from '../../messages';
import { formatLargeNumber, getDaysInRange } from '../../utils';
import { Props } from '../typings';
import useInternalAdoption from '../useInternalAdoption';

import messages from './messages';
import { Statistics } from './Statistics';

const InternalAdoptionCard = ({
  startAt,
  endAt,
  resolution = 'month',
  compareStartAt,
  compareEndAt,
  hideStatistics = false,
  showActiveStats = false,
  ariaLabel,
  ariaDescribedBy,
}: Props & AccessibilityProps) => {
  const { timeSeries, stats, currentResolution } = useInternalAdoption({
    start_at: startAt,
    end_at: endAt,
    resolution,
    compare_start_at: compareStartAt,
    compare_end_at: compareEndAt,
  });
  const { formatMessage } = useIntl();

  const previousDays = getDaysInRange(startAt, endAt);

  if (
    stats?.admins.active === 0 &&
    stats.moderators.active === 0 &&
    stats.total.registered === 0
  ) {
    return <NoData message={chartWidgetMessages.noData} />;
  }

  return (
    <Box className="e2e-internal-adoption-widget" height="100%">
      {!hideStatistics && stats && (
        <Statistics
          stats={stats}
          previousDays={previousDays}
          showActiveStats={showActiveStats}
        />
      )}
      <Box
        flexGrow={1}
        display="flex"
        justifyContent="flex-start"
        mt="28px"
        maxWidth="800px"
        h="240px"
      >
        <Chart
          startAtMoment={startAt ? moment(startAt) : null}
          endAtMoment={endAt ? moment(endAt) : null}
          resolution={currentResolution}
          margin={{
            left: 5,
            right: -20,
            top: 10,
            bottom: 0,
          }}
          yaxis={{
            orientation: 'right',
            tickFormatter: formatLargeNumber,
          }}
          timeSeries={timeSeries}
          ariaLabel={ariaLabel}
          ariaDescribedBy={ariaDescribedBy}
        />
      </Box>

      <A11yTable
        columns={[
          {
            key: 'date',
            label: formatMessage(messages.dateCoulmn),
            render: (value) => moment(value).format('MMM DD, YYYY'),
          },
          {
            key: 'activeAdmins',
            label: formatMessage(messages.activeAdminColumn),
          },
          {
            key: 'activeModerators',
            label: formatMessage(messages.activeModeratorColumn),
          },
          {
            key: 'totalActive',
            label: formatMessage(messages.totalActiveColumn),
          },
        ]}
        data={timeSeries || []}
        caption={formatMessage(messages.InternalAdoptionCaption)}
      />
    </Box>
  );
};

export default InternalAdoptionCard;
