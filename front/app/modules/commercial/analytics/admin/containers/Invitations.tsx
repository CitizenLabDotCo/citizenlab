import React from 'react';

// components
import InvitationsCard from '../components/InvitationsCard';
import { StatCardProps } from '../hooks/useStatCard/typings';

export default ({ ...props }: StatCardProps) => {
  return <InvitationsCard {...props} />;
};
