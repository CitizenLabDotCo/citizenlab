import React, { useState } from 'react';

import { Box, NewBOButton, NewBOText } from '@citizenlab/cl2-component-library';

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
        <NewBOButton
          buttonStyle="secondary-outlined"
          width="auto"
          onClick={() => setOpened(true)}
        >
          {formatMessage(messages.editAccess)}
        </NewBOButton>
      </Box>

      <Modal
        opened={opened}
        close={() => setOpened(false)}
        width="900px"
        header={formatMessage(messages.editAccess)}
      >
        <Box p="24px">
          <NewBOText variant="helper" mb="16px">
            {formatMessage(messages.editAccessDescription)}
          </NewBOText>
          <ActionForms phaseId={phaseId} />
        </Box>
      </Modal>
    </>
  );
};

export default EditAccessButton;
