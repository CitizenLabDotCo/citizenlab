import React from 'react';

import { IProjectData } from 'api/projects/types';

import { useIntl } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';

import backofficeRedesignMessages from '../messages';

import styles from './LivePanel.module.css';
import messages from './messages';
import PanelDivider from './PanelDivider';
import PanelHeading from './PanelHeading';
import ParticipantsGraph from './ParticipantsGraph';
import SetupCard from './SetupCard';

interface Props {
  project: IProjectData;
}

const LivePanel = ({ project }: Props) => {
  const { formatMessage } = useIntl();
  const projectId = project.id;

  const collecting = project.attributes.participation_status === 'active';

  return (
    <div>
      <PanelHeading
        title={formatMessage(
          collecting
            ? messages.collectingNow
            : backofficeRedesignMessages.participation
        )}
      />
      <ParticipantsGraph project={project} />
      <PanelDivider />
      <PanelHeading title={formatMessage(messages.nextActions)} />

      <div className={styles.actions}>
        <SetupCard
          id="e2e-next-action-message-participants"
          title={formatMessage(messages.actionMessageParticipants)}
          behaviour={{
            kind: 'action',
            icon: 'chevron-right-16',
            onClick: () =>
              clHistory.push(`/admin/projects/${projectId}/messaging`),
          }}
        />
      </div>
    </div>
  );
};

export default LivePanel;
