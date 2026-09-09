import React, { useState } from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import Modal from 'components/UI/Modal';

import { useIntl } from 'utils/cl-intl';

import AdminPhaseEmailWrapper from '../../../admin_phase_email_wrapper';
import PanelRow from '../../../phaseSetup/components/PhaseParticipationConfig/components/shared/PanelRow';
import messages from '../messages';

/**
 * The automated emails this phase sends. They used to be a phase tab; the
 * workspace has no tab strip, so they are reached from the settings panel.
 */
const NotificationsRow = () => {
  const { formatMessage } = useIntl();
  const [opened, setOpened] = useState(false);

  return (
    <>
      <PanelRow
        label={formatMessage(messages.notifications)}
        onClick={() => setOpened(true)}
      />
      <Modal
        opened={opened}
        close={() => setOpened(false)}
        header={formatMessage(messages.notifications)}
      >
        <Box p="24px">
          <AdminPhaseEmailWrapper />
        </Box>
      </Modal>
    </>
  );
};

export default NotificationsRow;
