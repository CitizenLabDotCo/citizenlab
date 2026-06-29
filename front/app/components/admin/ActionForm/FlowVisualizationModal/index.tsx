import React from 'react';

import { IPhasePermissionData } from 'api/phase_permissions/types';

import Modal from 'components/UI/Modal';

import FlowVisualization from './FlowVisualization';

interface Props {
  opened: boolean;
  permission: IPhasePermissionData;
  phaseId: string;
  onClose: () => void;
}

const FlowVisualizationModal = ({
  opened,
  permission,
  phaseId,
  onClose
}: Props) => {
  return (
    <Modal
      opened={opened}
      close={onClose}
      width="480px"
      ariaLabelledBy=""
    >
      <FlowVisualization
        permission={permission}
        phaseId={phaseId}
      />
    </Modal>
  )
};

export default FlowVisualizationModal;
