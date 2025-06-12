import React, { useCallback, useState } from 'react';

import { Text, Box, Button } from '@citizenlab/cl2-component-library';
import { IOption } from 'typings';

import ProjectFilter from 'containers/Admin/reporting/components/ReportBuilder/Widgets/_shared/ProjectFilter';

import Modal from 'components/UI/Modal';
import PhaseFilter from 'components/UI/PhaseFilter';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

type Props = {
  showPastInputsModal: boolean;
  setShowPastInputsModal: (show: boolean) => void;
};

const ImportInputsModal = ({
  showPastInputsModal,
  setShowPastInputsModal,
}: Props) => {
  const { formatMessage } = useIntl();

  const [projectId, setProjectId] = useState<string | undefined>();
  const [phaseId, setPhaseId] = useState<string | undefined>();

  const handleProjectFilter = useCallback(
    ({ value }: IOption) => {
      setProjectId(value);
    },
    [setProjectId]
  );

  const handlePhaseFilter = useCallback(
    ({ value }: IOption) => {
      setPhaseId(value);
    },
    [setPhaseId]
  );

  return (
    <Modal
      width={520}
      opened={showPastInputsModal}
      close={() => {
        setShowPastInputsModal(false);
      }}
      header={formatMessage(messages.startFromPastInputs)}
    >
      <Box m="24px" data-cy="e2e-copy-survey-modal">
        <Text mb="10px" variant="bodyS" color="textSecondary">
          {formatMessage(messages.createInputsDescription)}
        </Text>
        <Box py="5px" mt="0px" alignItems="center">
          <ProjectFilter
            projectId={projectId}
            emptyOptionMessage={messages.noProject}
            onProjectFilter={handleProjectFilter}
          />
          {projectId && (
            <PhaseFilter
              label={formatMessage(messages.selectAPhase)}
              projectId={projectId}
              phaseId={phaseId}
              participationMethods={['ideation', 'voting', 'common_ground']}
              onPhaseFilter={handlePhaseFilter}
            />
          )}
        </Box>

        <Box mt="40px" display="flex" justifyContent="space-between">
          <Button
            buttonStyle="secondary-outlined"
            onClick={() => {
              setShowPastInputsModal(false);
            }}
          >
            {formatMessage(messages.cancel)}
          </Button>
          <Button
            buttonStyle="admin-dark"
            disabled={!phaseId}
            onClick={() => {
              // Handle importing inputs
            }}
          >
            {formatMessage(messages.importInputs)}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default ImportInputsModal;
