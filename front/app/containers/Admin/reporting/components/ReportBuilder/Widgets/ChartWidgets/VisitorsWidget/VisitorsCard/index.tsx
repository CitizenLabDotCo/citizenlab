import React from 'react';

import useLayout from 'containers/Admin/reporting/hooks/useLayout';

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
  compareStartAt,
  compareEndAt,
  resolution,
  hideStatistics,
}: Props) => {
  const { currentResolution, stats, timeSeries } = useVisitors({
    startAt,
    endAt,
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
  };

  return layout === 'wide' ? <Wide {...props} /> : <Narrow {...props} />;
};

export default VisitorsCard;
