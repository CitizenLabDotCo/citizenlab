import React from 'react';

import StatCard from '../../../../../../components/admin/GraphCards/StatCard';
import { StatCardProps } from '../../../../../../components/admin/GraphCards/StatCard/useStatCard/typings';

import { eventsConfig } from './config';

const EventsCard = ({
  projectId,
  startAtMoment,
  endAtMoment,
  resolution,
}: StatCardProps) => {
  return (
    <StatCard
      config={eventsConfig}
      projectId={projectId}
      startAtMoment={startAtMoment}
      endAtMoment={endAtMoment}
      resolution={resolution}
    />
  );
};

export default EventsCard;
