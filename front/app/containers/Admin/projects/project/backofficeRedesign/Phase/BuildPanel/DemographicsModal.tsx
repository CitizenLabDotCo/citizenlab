import React, { useState } from 'react';

import { Box, Text } from '@citizenlab/cl2-component-library';

import { IPhasePermissionAction } from 'api/permissions/types';

import PhaseActionForm from 'containers/Admin/projects/_shared/components/PhaseActionForm';

import Modal from 'components/UI/Modal';

import { useIntl } from 'utils/cl-intl';

import messages from '../../messages';

import ActionTabs from './ActionTabs';

interface Props {
  phaseId: string;
  actions: IPhasePermissionAction[];
  opened: boolean;
  onClose: () => void;
}

const DemographicsModal = ({ phaseId, actions, opened, onClose }: Props) => {
  const { formatMessage } = useIntl();
  const [picked, setPicked] = useState<IPhasePermissionAction>();
  const selected = picked && actions.includes(picked) ? picked : actions[0];

  return (
    <Modal
      opened={opened}
      close={onClose}
      width="720px"
      header={formatMessage(messages.collectDemographicData)}
    >
      <Box p="24px" display="flex" flexDirection="column" gap="20px">
        <Text variant="boHelper" m="0">
          {formatMessage(messages.collectDemographicDataDescription)}
        </Text>
        {actions.length > 1 && (
          <Box>
            <ActionTabs
              actions={actions}
              selected={selected}
              onSelect={setPicked}
            />
          </Box>
        )}
        <PhaseActionForm
          // A new action starts from its own saved permission.
          key={selected}
          phaseId={phaseId}
          action={selected}
          variant="data"
        />
      </Box>
    </Modal>
  );
};

export default DemographicsModal;
