import React, { useState } from 'react';

import ActionForms from 'containers/Admin/projects/project/permissions/Phase/ActionForms';

import Button from 'design-system/Button';
import Modal from 'design-system/Modal';

import { useIntl } from 'utils/cl-intl';

import styles from './EditAccessButton.module.css';
import messages from './messages';
import 'design-system/tokens.css';

interface Props {
  phaseId: string;
  initialOpened?: boolean;
  showButton?: boolean;
  onClose?: () => void;
}

const EditAccessButton = ({
  phaseId,
  initialOpened = false,
  showButton = true,
  onClose,
}: Props) => {
  const { formatMessage } = useIntl();
  const [opened, setOpened] = useState(initialOpened);

  const close = () => {
    setOpened(false);
    onClose?.();
  };

  return (
    <>
      {showButton && (
        <div className={styles.buttonRow}>
          <Button variant="secondary" size={32} onPress={() => setOpened(true)}>
            {formatMessage(messages.editAccess)}
          </Button>
        </div>
      )}

      <Modal
        isOpen={opened}
        onOpenChange={(isOpen) => {
          if (isOpen) {
            setOpened(true);
          } else {
            close();
          }
        }}
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
