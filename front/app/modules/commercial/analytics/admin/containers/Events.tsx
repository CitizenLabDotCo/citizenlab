import React from 'react';

// components
import { StatCardProps } from '../hooks/useStatCard/typings';
import EventsCard from '../components/EventsCard';

export default ({ ...props }: StatCardProps) => {
  return null; // Disabled until translations arrive
  return <EventsCard {...props} />;
};
