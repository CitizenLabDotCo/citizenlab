import React from 'react';

import useLayout from 'containers/Admin/reporting/hooks/useLayout';

import { AccessibilityProps } from 'components/admin/Graphs/typings';

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
  participationTypes,
  ariaLabel,
  ariaDescribedBy,
}: Props & AccessibilityProps) => {
  const layout = useLayout();

  const { timeSeries, stats, currentResolution } = useParticipation({
    project_id: projectId,
    start_at: startAt,
    end_at: endAt,
    resolution,
    compare_start_at: compareStartAt,
    compare_end_at: compareEndAt,
  });

  if (
    stats?.inputs.value === 0 &&
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    stats?.comments.value === 0 &&
    // TODO: Fix this the next time the file is edited.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    stats?.votes.value === 0
  ) {
    return <NoData message={chartWidgetMessages.noData} />;
  }

  const props = {
    startAt,
    endAt,
    hideStatistics,
    timeSeries,
    stats,
    currentResolution,
    participationTypes,
    ariaLabel,
    ariaDescribedBy,
  };

  return layout === 'wide' ? <Wide {...props} /> : <Narrow {...props} />;
};

export default ParticipationCard;
