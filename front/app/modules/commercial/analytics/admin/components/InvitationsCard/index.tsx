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
