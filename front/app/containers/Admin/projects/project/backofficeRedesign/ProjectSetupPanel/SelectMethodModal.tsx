import React, { useState } from 'react';

import { Box, Button } from '@citizenlab/cl2-component-library';

import { ParticipationMethod } from 'api/phases/types';

import ParticipationMethodPicker from 'containers/Admin/projects/project/phaseSetup/components/PhaseParticipationConfig/components/ParticipationMethodPicker';

import Modal from 'components/UI/Modal';

import { useIntl } from 'utils/cl-intl';
import clHistory from 'utils/cl-router/history';

import messages from '../messages';

interface Props {
  projectId: string;
  opened: boolean;
  onClose: () => void;
}

// Picking a method only opens the build view of a phase that isn't saved yet:
// the phase is created there once it has a title and dates. The picker needs a
// confirm step because the survey card only reveals the poll option after it
// is selected. External survey providers are left out of this flow.
const SelectMethodModal = ({ projectId, opened, onClose }: Props) => {
  const { formatMessage } = useIntl();
  const [participationMethod, setParticipationMethod] =
    useState<ParticipationMethod>('ideation');

  const handleContinue = () => {
    onClose();
    clHistory.push({
      pathname: `/admin/projects/${projectId}/phases/new`,
      search: `?participation_method=${participationMethod}`,
    });
  };

  return (
    <Modal
      opened={opened}
      close={onClose}
      width={840}
      padding="0px"
      header={formatMessage(messages.selectAMethod)}
      footer={
        <Box display="flex" justifyContent="flex-end" width="100%">
          <Button buttonStyle="admin-dark" onClick={handleContinue}>
            {formatMessage(messages.selectMethodContinue)}
          </Button>
        </Box>
      }
    >
      <Box p="24px">
        <ParticipationMethodPicker
          participation_method={participationMethod}
          showSurveys={false}
          apiErrors={null}
          handleParticipationMethodOnChange={setParticipationMethod}
        />
      </Box>
    </Modal>
  );
};

export default SelectMethodModal;
