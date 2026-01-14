import React from 'react';

import useLayout from 'containers/Admin/reporting/hooks/useLayout';

import { AccessibilityProps } from 'components/admin/Graphs/typings';

import NoData from '../../../_shared/NoData';
import chartWidgetMessages from '../../messages';
import { Props } from '../typings';
import useParticipants from '../useParticipants';

import Narrow from './Narrow';
import Wide from './Wide';

const ParticipantsCard = ({
  projectId,
  startAt,
  endAt,
  resolution = 'month',
  compareStartAt,
  compareEndAt,
  hideStatistics = false,
  ariaLabel,
  ariaDescribedBy,
  showVisitors = false,
}: Props & AccessibilityProps) => {
  const { currentResolution, stats, timeSeries } = useParticipants({
    project_id: projectId,
    start_at: startAt,
    end_at: endAt,
    resolution,
    compare_start_at: compareStartAt,
    compare_end_at: compareEndAt,
  });

  const layout = useLayout();

  if (!stats || stats.participants.value === 0) {
    return <NoData message={chartWidgetMessages.noData} />;
  }

  const props = {
    startAt,
    endAt,
    hideStatistics,
    showVisitors,
    timeSeries,
    stats,
    currentResolution,
    ariaLabel,
    ariaDescribedBy,
  };

  return layout === 'wide' ? <Wide {...props} /> : <Narrow {...props} />;
};

export default ParticipantsCard;
