import React from 'react';

import { IPhaseData } from 'api/phases/types';

import usePhaseEmailCampaigns from 'containers/Admin/projects/project/admin_phase_email_wrapper/usePhaseEmailCampaigns';

import Spinner from 'design-system/Spinner';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';
import NotificationRow from './NotificationRow';
import styles from './PhaseNotifications.module.css';
import 'design-system/tokens.css';

interface Props {
  phase: IPhaseData;
}

const PhaseNotifications = ({ phase }: Props) => {
  const { formatMessage } = useIntl();
  const { campaigns, loading } = usePhaseEmailCampaigns(phase.id);

  if (loading) return <Spinner />;

  return (
    <div className={styles.list}>
      <p className={styles.description}>
        {formatMessage(messages.participantCommunicationsDescription)}
      </p>
      {campaigns.map((campaign) => (
        <NotificationRow
          key={campaign.id}
          campaign={campaign}
          projectId={phase.relationships.project.data.id}
          phaseId={phase.id}
        />
      ))}
    </div>
  );
};

export default PhaseNotifications;
