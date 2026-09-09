import React, { useState } from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import { ParticipationMethod } from 'api/phases/types';

import CustomMapConfigPage from 'containers/Admin/CustomMapConfigPage';

import Modal from 'components/UI/Modal';

import { useIntl } from 'utils/cl-intl';

import PanelRow from '../../../phaseSetup/components/PhaseParticipationConfig/components/shared/PanelRow';
import messages from '../messages';

// The methods that offer a map view, and so have a map to configure. Mirrors
// the condition the phase tab strip used.
const METHODS_WITH_A_MAP: ParticipationMethod[] = [
  'ideation',
  'voting',
  'proposals',
];

interface Props {
  participationMethod: ParticipationMethod;
}

const MapConfigurationRow = ({ participationMethod }: Props) => {
  const { formatMessage } = useIntl();
  const [opened, setOpened] = useState(false);

  if (!METHODS_WITH_A_MAP.includes(participationMethod)) return null;

  return (
    <>
      <PanelRow
        label={formatMessage(messages.mapConfiguration)}
        onClick={() => setOpened(true)}
      />
      <Modal
        opened={opened}
        close={() => setOpened(false)}
        header={formatMessage(messages.mapConfiguration)}
        width="1100px"
      >
        <Box p="24px">
          <CustomMapConfigPage />
        </Box>
      </Modal>
    </>
  );
};

export default MapConfigurationRow;
