import React, { useState } from 'react';

import Button from 'design-system/Button';
import Modal from 'design-system/Modal';
import 'design-system/tokens.css';

import ActionForms from 'containers/Admin/projects/project/permissions/Phase/ActionForms';

import { useIntl } from 'utils/cl-intl';

import styles from './EditAccessButton.module.css';
import messages from './messages';

interface Props {
  phaseId: string;
}

const EditAccessButton = ({ phaseId }: Props) => {
  const { formatMessage } = useIntl();
  const [opened, setOpened] = useState(false);

  return (
    <>
      <div className={styles.buttonRow}>
        <Button variant="secondary" size={32} onPress={() => setOpened(true)}>
          {formatMessage(messages.editAccess)}
        </Button>
      </div>

      <Modal
        isOpen={opened}
        onOpenChange={setOpened}
        size={920}
        title={formatMessage(messages.editAccess)}
        description={formatMessage(messages.editAccessDescription)}
      >
        <ActionForms phaseId={phaseId} />
      </Modal>
    </>
  );
};

export default EditAccessButton;
