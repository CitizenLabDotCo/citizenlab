import React, { useState } from 'react';

import { IProjectData } from 'api/projects/types';

import ConfirmStatusChangeModal from 'containers/Admin/projects/project/backofficeRedesign/Header/PublishDropdown/ConfirmStatusChangeModal';

import { useIntl } from 'utils/cl-intl';

import backofficeRedesignMessages from '../messages';

import styles from './ArchivedPanel.module.css';
import FinalRecordCard from './FinalRecordCard';
import messages from './messages';
import SetupCard from './SetupCard';

interface Props {
  project: IProjectData;
}

const ArchivedPanel = ({ project }: Props) => {
  const { formatMessage } = useIntl();
  const [restoreOpened, setRestoreOpened] = useState(false);

  return (
    <div>
      <p className={styles.explanation}>
        {formatMessage(messages.archivedExplanation)}
      </p>
      <FinalRecordCard project={project} />
      <SetupCard
        id="e2e-next-action-restore-draft"
        title={formatMessage(backofficeRedesignMessages.publishRestoreToDraft)}
        behaviour={{
          kind: 'action',
          icon: 'chevron-right-16',
          onClick: () => setRestoreOpened(true),
        }}
      />

      <ConfirmStatusChangeModal
        opened={restoreOpened}
        status="draft"
        project={project}
        onClose={() => setRestoreOpened(false)}
      />
    </div>
  );
};

export default ArchivedPanel;
