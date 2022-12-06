import React from 'react';
import { StatCardProps } from '../hooks/useStatCard/typings';
// hooks
import useFeatureFlag from 'hooks/useFeatureFlag';
// components
import ProposalsCard from '../components/ProposalsCard';

export default ({ ...props }: StatCardProps) => {
  const proposalsActive = useFeatureFlag({ name: 'initiatives' });

  if (!proposalsActive) return null;

  return <ProposalsCard {...props} />;
};
