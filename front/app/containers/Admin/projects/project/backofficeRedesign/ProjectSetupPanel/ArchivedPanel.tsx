import React, { useState } from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';

import { IProjectData } from 'api/projects/types';

import ConfirmStatusChangeModal from 'containers/Admin/projects/project/backofficeRedesign/Header/PublishDropdown/ConfirmStatusChangeModal';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

import FinalRecordCard from './FinalRecordCard';
import SetupCard from './SetupCard';

interface Props {
  project: IProjectData;
}

const ArchivedPanel = ({ project }: Props) => {
  const { formatMessage } = useIntl();
  const [restoreOpened, setRestoreOpened] = useState(false);

  return (
    <Box>
      <Text variant="boHelper" m="0">
        {formatMessage(messages.archivedExplanation)}
      </Text>
      <FinalRecordCard project={project} />
      <SetupCard
        id="e2e-next-action-restore-draft"
        title={formatMessage(messages.publishRestoreToDraft)}
        behaviour={{
          kind: 'action',
          icon: 'chevron-right',
          onClick: () => setRestoreOpened(true),
        }}
      />

      <ConfirmStatusChangeModal
        opened={restoreOpened}
        status="draft"
        project={project}
        onClose={() => setRestoreOpened(false)}
      />
    </Box>
  );
};

export default ArchivedPanel;
