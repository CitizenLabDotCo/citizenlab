import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';
import moment from 'moment';

import Chart from 'components/admin/GraphCards/InternalAdoptionCard/Chart';
import { AccessibilityProps } from 'components/admin/Graphs/typings';

import NoData from '../../../_shared/NoData';
import chartWidgetMessages from '../../messages';
import { formatLargeNumber, getDaysInRange } from '../../utils';
import { Props } from '../typings';
import useInternalAdoption from '../useInternalAdoption';

import { Statistics } from './Statistics';

const InternalAdoptionCard = ({
  startAt,
  endAt,
  resolution = 'month',
  compareStartAt,
  compareEndAt,
  hideStatistics = false,
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

  const previousDays = getDaysInRange(startAt, endAt);

  if (
    stats?.activeAdmins.value === 0 &&
    stats.activeModerators.value === 0 &&
    stats.totalAdminPm.value === 0
  ) {
    return <NoData message={chartWidgetMessages.noData} />;
  }

  return (
    <Box className="e2e-internal-adoption-widget" height="100%">
      {!hideStatistics && stats && (
        <Statistics stats={stats} previousDays={previousDays} />
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
    </Box>
  );
};

export default InternalAdoptionCard;
