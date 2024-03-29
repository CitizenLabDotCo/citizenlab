import React from 'react';

import useFeatureFlag from 'hooks/useFeatureFlag';

import StatCard from '../StatCard';
import { StatCardProps } from '../StatCard/useStatCard/typings';

import { proposalsConfig } from './config';

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
