import React from 'react';

import useLayout from 'containers/Admin/reporting/hooks/useLayout';

import { AccessibilityProps } from 'components/admin/Graphs/typings';

import NoData from '../../../_shared/NoData';
import chartWidgetMessages from '../../messages';
import { Props } from '../typings';
import useRegistrations from '../useRegistrations';

import Narrow from './Narrow';
import Wide from './Wide';

const RegistrationsCard = ({
  startAt,
  endAt,
  resolution = 'month',
  compareStartAt,
  compareEndAt,
  hideStatistics = false,
  ariaLabel,
  ariaDescribedBy,
}: Props & AccessibilityProps) => {
  const { currentResolution, stats, timeSeries } = useRegistrations({
    start_at: startAt,
    end_at: endAt,
    resolution,
    compare_start_at: compareStartAt,
    compare_end_at: compareEndAt,
  });

  const layout = useLayout();

  if (!stats || stats.registrations.value === 0) {
    return <NoData message={chartWidgetMessages.noData} />;
  }

  const props = {
    startAt,
    endAt,
    hideStatistics,
    timeSeries,
    stats,
    currentResolution,
    ariaLabel,
    ariaDescribedBy,
  };

  return layout === 'wide' ? <Wide {...props} /> : <Narrow {...props} />;
};

export default RegistrationsCard;
