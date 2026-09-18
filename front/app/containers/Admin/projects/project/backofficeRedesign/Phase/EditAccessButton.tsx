import React, { useState } from 'react';

import { Box, Button, Text } from '@citizenlab/cl2-component-library';

import ActionForms from 'containers/Admin/projects/project/permissions/Phase/ActionForms';

import Modal from 'components/UI/Modal';

import { useIntl } from 'utils/cl-intl';

import messages from '../messages';

interface Props {
  phaseId: string;
}

const EditAccessButton = ({ phaseId }: Props) => {
  const { formatMessage } = useIntl();
  const [opened, setOpened] = useState(false);

  return (
    <>
      <Box display="flex" py="16px">
        <Button
          buttonStyle="secondary-outlined"
          size="s"
          width="auto"
          onClick={() => setOpened(true)}
        >
          {formatMessage(messages.editAccess)}
        </Button>
      </Box>

      <Modal
        opened={opened}
        close={() => setOpened(false)}
        width="900px"
        header={formatMessage(messages.editAccess)}
      >
        <Box p="24px">
          <Text mt="0" color="textSecondary">
            {formatMessage(messages.editAccessDescription)}
          </Text>
          <ActionForms phaseId={phaseId} />
        </Box>
      </Modal>
    </>
  );
};

export default EditAccessButton;
