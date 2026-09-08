import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import Modal from 'components/UI/Modal';

import { useIntl } from 'utils/cl-intl';

import ParticipationMethodPicker from '../../phaseSetup/components/PhaseParticipationConfig/components/ParticipationMethodPicker';

import messages from './messages';

interface Props {
  opened: boolean;
  onClose: () => void;
}

// Preview of the phase method picker in a modal. Picking a method does not
// create a phase yet — the flow that turns a choice into a phase is not built.
// External survey providers are left out until this drives a real phase.
const SelectMethodModal = ({ opened, onClose }: Props) => {
  const { formatMessage } = useIntl();

  return (
    <Modal
      opened={opened}
      close={onClose}
      width={840}
      padding="0px"
      header={formatMessage(messages.selectAMethod)}
    >
      <Box p="24px">
        <ParticipationMethodPicker
          participation_method="ideation"
          showSurveys={false}
          apiErrors={null}
          handleParticipationMethodOnChange={() => {}}
        />
      </Box>
    </Modal>
  );
};

export default SelectMethodModal;
