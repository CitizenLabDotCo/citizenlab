import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import { IProjectData } from 'api/projects/types';

import { useIntl } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';

import messages from '../messages';

import CreateReportCard from './CreateReportCard';
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
    <Box>
      <PanelHeading
        title={formatMessage(
          collecting ? messages.collectingNow : messages.participation
        )}
      />
      <ParticipantsGraph project={project} />
      <PanelDivider />
      <PanelHeading title={formatMessage(messages.nextActions)} />

      <Box display="flex" flexDirection="column" gap="8px">
        <SetupCard
          id="e2e-next-action-message-participants"
          title={formatMessage(messages.actionMessageParticipants)}
          behaviour={{
            kind: 'action',
            icon: 'chevron-right',
            onClick: () =>
              clHistory.push(`/admin/projects/${projectId}/messaging`),
          }}
        />
        <CreateReportCard />
      </Box>
    </Box>
  );
};

export default LivePanel;
