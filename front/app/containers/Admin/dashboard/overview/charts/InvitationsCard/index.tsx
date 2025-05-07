import React from 'react';

import StatCard from '../../../../../../components/admin/GraphCards/StatCard';
import { StatCardProps } from '../../../../../../components/admin/GraphCards/StatCard/useStatCard/typings';

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
