import React, { useState } from 'react';

import { Box, Button, Text } from '@citizenlab/cl2-component-library';

import ActionForms from 'containers/Admin/projects/project/permissions/Phase/ActionForms';

import Modal from 'components/UI/Modal';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

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
        <Box display="flex" py="16px">
          <Button
            buttonStyle="bo-secondary"
            width="auto"
            onClick={() => setOpened(true)}
          >
            {formatMessage(messages.editAccess)}
          </Button>
        </Box>
      )}

      <Modal
        opened={opened}
        close={close}
        width="900px"
        header={formatMessage(messages.editAccess)}
      >
        <Box p="24px">
          <Text variant="boHelper" mb="16px">
            {formatMessage(messages.editAccessDescription)}
          </Text>
          <ActionForms phaseId={phaseId} />
        </Box>
      </Modal>
    </>
  );
};

export default EditAccessButton;
