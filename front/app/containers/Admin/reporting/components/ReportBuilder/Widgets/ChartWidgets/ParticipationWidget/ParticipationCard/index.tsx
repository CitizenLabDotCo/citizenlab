import React from 'react';

import useLayout from 'containers/Admin/reporting/hooks/useLayout';

import NoData from '../../../_shared/NoData';
import chartWidgetMessages from '../../messages';
import { Props } from '../typings';
import useParticipation from '../useParticipation';

import Narrow from './Narrow';
import Wide from './Wide';

const ParticipationCard = ({
  projectId,
  startAt,
  endAt,
  resolution = 'month',
  compareStartAt,
  compareEndAt,
  hideStatistics = false,
}: Props) => {
  const layout = useLayout();

  const { timeSeries, currentResolution } = useParticipation({
    project_id: projectId,
    start_at: startAt,
    end_at: endAt,
    resolution,
    compare_start_at: compareStartAt,
    compare_end_at: compareEndAt,
  });

  if (!timeSeries) {
    return <NoData message={chartWidgetMessages.noData} />;
  }

  const props = {
    startAt,
    endAt,
    hideStatistics,
    timeSeries,
    // stats,
    currentResolution,
  };

  return layout === 'wide' ? <Wide {...props} /> : <Narrow {...props} />;
};

export default ParticipationCard;
