import React from 'react';

import { StatCardProps } from '../../hooks/useStatCard/typings';
import StatCard from '../StatCard';
import { invitationsConfig } from './config';

const InvitationsCard = ({
  projectId,
  startAtMoment,
  endAtMoment,
  resolution,
}: StatCardProps) => {
  const config = invitationsConfig;

  return (
    <StatCard
      config={config}
      projectId={projectId}
      startAtMoment={startAtMoment}
      endAtMoment={endAtMoment}
      resolution={resolution}
    />
  );
};

export default InvitationsCard;
