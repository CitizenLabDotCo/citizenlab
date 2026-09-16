import React from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';

import usePhases from 'api/phases/usePhases';

import InputManager from 'components/admin/PostManager/InputManager';
import Modal from 'components/UI/Modal';

import { useIntl } from 'utils/cl-intl';

import messages from '../../messages';

interface Props {
  projectId: string;
  phaseId: string;
  opened: boolean;
  onClose: () => void;
}

// The input manager's timeline filter is how ideas are added to a phase: they
// are dragged from another phase onto this one.
const AddPreviousPhaseIdeasModal = ({
  projectId,
  phaseId,
  opened,
  onClose,
}: Props) => {
  const { formatMessage } = useIntl();
  const { data: phases } = usePhases(projectId);

  return (
    <Modal
      opened={opened}
      close={onClose}
      width={1200}
      header={formatMessage(messages.addIdeasFromPreviousPhase)}
    >
      <Box p="24px">
        <Text mt="0" color="textSecondary">
          {formatMessage(messages.addIdeasFromPreviousPhaseDescription)}
        </Text>
        <InputManager
          projectId={projectId}
          phaseId={phaseId}
          phases={phases?.data}
          visibleFilterMenus={['phases']}
          defaultFilterMenu="phases"
        />
      </Box>
    </Modal>
  );
};

export default AddPreviousPhaseIdeasModal;
