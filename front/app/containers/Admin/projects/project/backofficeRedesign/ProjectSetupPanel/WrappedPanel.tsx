import React, { useState } from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import { IProjectData } from 'api/projects/types';

import { useIntl } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';

import ConfirmStatusChangeModal from '../Header/PublishDropdown/ConfirmStatusChangeModal';
import messages from '../messages';

import CreateReportCard from './CreateReportCard';
import PanelHeading from './PanelHeading';
import PhaseResultsCard from './PhaseResultsCard';
import SetupCard from './SetupCard';

interface Props {
  project: IProjectData;
}

const WrappedPanel = ({ project }: Props) => {
  const { formatMessage } = useIntl();
  const projectId = project.id;
  const [archiveOpened, setArchiveOpened] = useState(false);

  return (
    <Box>
      <PanelHeading title={formatMessage(messages.nextActions)} />
      <PhaseResultsCard project={project} />

      <Box display="flex" flexDirection="column" gap="8px">
        <SetupCard
          id="e2e-next-action-share-results"
          title={formatMessage(messages.actionShareResults)}
          behaviour={{
            kind: 'action',
            icon: 'chevron-right',
            onClick: () =>
              clHistory.push(`/admin/projects/${projectId}/messaging/new`),
          }}
        />
        <CreateReportCard />
        <SetupCard
          id="e2e-next-action-archive"
          title={formatMessage(messages.actionArchiveProject)}
          behaviour={{
            kind: 'action',
            icon: 'chevron-right',
            onClick: () => setArchiveOpened(true),
          }}
        />
      </Box>

      <ConfirmStatusChangeModal
        opened={archiveOpened}
        status="archived"
        project={project}
        onClose={() => setArchiveOpened(false)}
      />
    </Box>
  );
};

export default WrappedPanel;
