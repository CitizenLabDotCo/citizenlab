import React from 'react';

import { StatCardProps } from '../../hooks/useStatCard/typings';
import StatCard from '../StatCard';

import { invitationsQuery, parseInvitationsChartData } from './parse';

const InvitationsCard = ({
  projectId,
  startAtMoment,
  endAtMoment,
  resolution,
}: StatCardProps) => {
  const parseChartData = parseInvitationsChartData;
  const query = invitationsQuery;

  return (
    <StatCard
      query={query}
      parseChartData={parseChartData}
      projectId={projectId}
      startAtMoment={startAtMoment}
      endAtMoment={endAtMoment}
      resolution={resolution}
    />
  );
};

export default InvitationsCard;
