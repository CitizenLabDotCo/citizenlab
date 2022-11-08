import React from 'react';

// hooks
import useFeatureFlag from 'hooks/useFeatureFlag';

// components
import InvitationsCard from '../components/InvitationsCard';
import { StatCardProps } from '../hooks/useStatCard/typings';

export default ({ ...props }: StatCardProps) => {
  const analyticsActive = useFeatureFlag({ name: 'analytics' });

  if (!analyticsActive) return null;

  return <InvitationsCard {...props} />;
};
