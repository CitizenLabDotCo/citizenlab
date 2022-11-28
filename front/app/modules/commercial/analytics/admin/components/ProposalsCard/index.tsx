import React from 'react';

import { StatCardProps } from '../../hooks/useStatCard/typings';
import StatCard from '../StatCard';
import { proposalsConfig } from './config';

const ProposalsCard = ({
  projectId,
  startAtMoment,
  endAtMoment,
  resolution,
}: StatCardProps) => {
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
