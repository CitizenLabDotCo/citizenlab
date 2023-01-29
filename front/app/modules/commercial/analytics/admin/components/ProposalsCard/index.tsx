import React from 'react';
import { proposalsConfig } from './config';

// hooks
import useFeatureFlag from 'hooks/useFeatureFlag';

// components
import StatCard from '../StatCard';

// typings
import { StatCardProps } from '../StatCard/useStatCard/typings';

const ProposalsCard = ({
  projectId,
  startAtMoment,
  endAtMoment,
  resolution,
}: StatCardProps) => {
  const proposalsActive = useFeatureFlag({ name: 'initiatives' });
  if (!proposalsActive) return null;

  return (
    <StatCard
      config={proposalsConfig}
      projectId={projectId}
      startAtMoment={startAtMoment}
      endAtMoment={endAtMoment}
      resolution={resolution}
    />
  );
};

export default ProposalsCard;
