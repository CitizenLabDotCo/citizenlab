import React from 'react';
import { StatCardProps } from '../hooks/useStatCard/typings';
// components
import InvitationsCard from '../components/InvitationsCard';

export default ({ ...props }: StatCardProps) => {
  return <InvitationsCard {...props} />;
};
