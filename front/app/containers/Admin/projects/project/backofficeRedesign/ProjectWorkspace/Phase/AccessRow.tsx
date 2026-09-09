import React, { useState } from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import Modal from 'components/UI/Modal';

import { useIntl } from 'utils/cl-intl';

import ActionForms from '../../../permissions/Phase/ActionForms';
import PanelRow from '../../../phaseSetup/components/PhaseParticipationConfig/components/shared/PanelRow';
import messages from '../messages';

interface Props {
  phaseId: string;
}

/**
 * Who may take part in this phase. It used to be a phase tab; the workspace
 * has no tab strip, so it is reached from the settings panel.
 */
const AccessRow = ({ phaseId }: Props) => {
  const { formatMessage } = useIntl();
  const [opened, setOpened] = useState(false);

  return (
    <>
      <PanelRow
        label={formatMessage(messages.accessRights)}
        onClick={() => setOpened(true)}
      />
      <Modal
        opened={opened}
        close={() => setOpened(false)}
        header={formatMessage(messages.accessRights)}
      >
        <Box p="24px">
          <ActionForms phaseId={phaseId} />
        </Box>
      </Modal>
    </>
  );
};

export default AccessRow;
