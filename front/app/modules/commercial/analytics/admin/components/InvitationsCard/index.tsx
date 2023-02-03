import React from 'react';

import { StatCardProps } from '../StatCard/useStatCard/typings';
import StatCard from '../StatCard';
import { invitationsConfig } from './config';

const InvitationsCard = ({
  projectId,
  startAtMoment,
  endAtMoment,
  resolution,
}: StatCardProps) => {
  return (
    <StatCard
      config={invitationsConfig}
      projectId={projectId}
      startAtMoment={startAtMoment}
      endAtMoment={endAtMoment}
      resolution={resolution}
    />
  );
};

export default InvitationsCard;
