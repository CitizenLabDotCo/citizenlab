import React from 'react';

import { Box, Spinner } from '@citizenlab/cl2-component-library';

import { IPhaseData } from 'api/phases/types';

import usePhaseEmailCampaigns from 'containers/Admin/projects/project/admin_phase_email_wrapper/usePhaseEmailCampaigns';

import NotificationRow from './NotificationRow';

interface Props {
  phase: IPhaseData;
}

const PhaseNotifications = ({ phase }: Props) => {
  const { campaigns, loading } = usePhaseEmailCampaigns(phase.id);

  if (loading) return <Spinner size="20px" />;

  return (
    <Box display="flex" flexDirection="column" gap="16px">
      {campaigns.map((campaign) => (
        <NotificationRow
          key={campaign.id}
          campaign={campaign}
          projectId={phase.relationships.project.data.id}
          phaseId={phase.id}
        />
      ))}
    </Box>
  );
};

export default PhaseNotifications;
