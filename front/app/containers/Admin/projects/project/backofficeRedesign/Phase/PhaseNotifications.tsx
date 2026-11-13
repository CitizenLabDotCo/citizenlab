import React from 'react';

import { Box, Spinner, Text } from '@citizenlab/cl2-component-library';

import { IPhaseData } from 'api/phases/types';

import usePhaseEmailCampaigns from 'containers/Admin/projects/project/admin_phase_email_wrapper/usePhaseEmailCampaigns';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';
import NotificationRow from './NotificationRow';

interface Props {
  phase: IPhaseData;
}

const PhaseNotifications = ({ phase }: Props) => {
  const { formatMessage } = useIntl();
  const { campaigns, loading } = usePhaseEmailCampaigns(phase.id);

  if (loading) return <Spinner size="20px" />;

  return (
    <Box display="flex" flexDirection="column" gap="16px">
      <Text variant="boHelper" m="0">
        {formatMessage(messages.participantEmailsDescription)}
      </Text>
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
