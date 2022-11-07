import React from 'react';

// hooks
import useFeatureFlag from 'hooks/useFeatureFlag';

// components
import InvitationsCard from '../components/InvitationsCard';
import { StatCardPeriodProps } from '../typings';

export default ({ ...props }: StatCardPeriodProps) => {
  const analyticsActive = useFeatureFlag({ name: 'analytics' });

  if (!analyticsActive) return null;

  return <InvitationsCard {...props} />;
};
