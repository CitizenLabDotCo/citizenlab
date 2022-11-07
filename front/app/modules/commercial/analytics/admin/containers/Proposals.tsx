import React from 'react';

// hooks
import useFeatureFlag from 'hooks/useFeatureFlag';

// components
import ProposalsCard from '../components/ProposalsCard';
import { StatCardPeriodProps } from '../typings';

export default ({ ...props }: StatCardPeriodProps) => {
  const analyticsActive = useFeatureFlag({ name: 'analytics' });

  if (!analyticsActive) return null;

  return <ProposalsCard {...props} />;
};
