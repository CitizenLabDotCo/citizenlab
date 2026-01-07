import React from 'react';

import moment from 'moment';

import { AccessibilityProps } from 'components/admin/Graphs/typings';

import NoData from '../../../_shared/NoData';
import chartWidgetMessages from '../../messages';
import { formatLargeNumber, getDaysInRange } from '../../utils';
import { Props } from '../typings';
import useInternalAdoption from '../useInternalAdoption';

import Chart from './Chart';

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

  if (stats?.activeAdmins.value === 0 && stats.activeModerators.value === 0) {
    return <NoData message={chartWidgetMessages.noData} />;
  }

  return (
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
      previousDays={previousDays}
      hideStatistics={hideStatistics}
      timeSeries={timeSeries}
      stats={stats}
      ariaLabel={ariaLabel}
      ariaDescribedBy={ariaDescribedBy}
    />
  );
};

export default InternalAdoptionCard;
