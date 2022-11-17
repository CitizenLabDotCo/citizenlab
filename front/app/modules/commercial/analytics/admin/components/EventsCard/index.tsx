import React from 'react';

import { StatCardProps } from '../../hooks/useStatCard/typings';
import StatCard from '../StatCard';
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
