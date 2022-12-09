import React from 'react';

// components
import { StatCardProps } from '../hooks/useStatCard/typings';
import EventsCard from '../components/EventsCard';

export default ({ ...props }: StatCardProps) => {
  return <EventsCard {...props} />;
};
