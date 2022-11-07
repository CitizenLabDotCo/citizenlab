import React from 'react';

// hooks
import useFeatureFlag from 'hooks/useFeatureFlag';

// components
import ProposalsCard, { Props } from '../components/ProposalsCard';

export default ({ ...props }: Props) => {
  const analyticsActive = useFeatureFlag({ name: 'analytics' });

  if (!analyticsActive) return null;

  return <ProposalsCard {...props} />;
};
