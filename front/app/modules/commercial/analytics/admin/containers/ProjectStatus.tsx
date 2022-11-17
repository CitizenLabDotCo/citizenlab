import React from 'react';

// components
import { StatCardProps } from '../hooks/useStatCard/typings';
import ProjectStatusCard from '../components/ProjectStatusCard';

export default ({ ...props }: StatCardProps) => {
  return <ProjectStatusCard {...props} />;
};
