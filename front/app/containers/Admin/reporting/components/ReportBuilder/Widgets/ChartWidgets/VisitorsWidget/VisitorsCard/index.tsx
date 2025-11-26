import React from 'react';

import useLayout from 'containers/Admin/reporting/hooks/useLayout';

import { AccessibilityProps } from 'components/admin/Graphs/typings';

import NoData from '../../../_shared/NoData';
import messages from '../../messages';
import { Props } from '../typings';
import useVisitors from '../useVisitors';

import Narrow from './Narrow';
import Wide from './Wide';

// Report specific version of <VisitorsCard/>
const VisitorsCard = ({
  startAt,
  endAt,
  projectId,
  compareStartAt,
  compareEndAt,
  resolution,
  hideStatistics,
  ariaLabel,
  description,
  ariaDescribedBy,
}: Props & AccessibilityProps) => {
  const { currentResolution, stats, timeSeries } = useVisitors({
    startAt,
    endAt,
    projectId,
    compareStartAt,
    compareEndAt,
    resolution,
  });

  const layout = useLayout();

  if (!stats) {
    return <NoData message={messages.noData} />;
  }

  const props = {
    startAt,
    endAt,
    timeSeries,
    stats,
    currentResolution,
    hideStatistics,
    ariaLabel,
    description,
    ariaDescribedBy,
  };

  return layout === 'wide' ? <Wide {...props} /> : <Narrow {...props} />;
};

export default VisitorsCard;
