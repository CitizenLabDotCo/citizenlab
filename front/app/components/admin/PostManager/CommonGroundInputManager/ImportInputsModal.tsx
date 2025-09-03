import React, { useCallback, useEffect, useState } from 'react';

import { Box, Button, Text } from '@citizenlab/cl2-component-library';
import { useParams } from 'react-router-dom';
import { IOption } from 'typings';

import { IJob } from 'api/copy_inputs/types';
import useCopyInputs from 'api/copy_inputs/useCopyInputs';
import usePhase from 'api/phases/usePhase';

import Modal from 'components/UI/Modal';
import PhaseFilter from 'components/UI/PhaseFilter';
import ProjectFilter from 'components/UI/ProjectFilter';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

interface Props {
  showPastInputsModal: boolean;
  setShowPastInputsModal: (show: boolean) => void;
  currentPhaseid: string;
}

const ImportInputsModal = ({
  showPastInputsModal,
  setShowPastInputsModal,
  currentPhaseid,
}: Props) => {
  const { projectId: currentProjectId } = useParams();
  const { formatMessage } = useIntl();
  const [selectedProjectId, setSelectedProjectId] = useState<
    string | undefined
  >();
  const [phaseId, setPhaseId] = useState<string | undefined>();
  const [noOfInputs, setNoOfInputs] = useState<number | undefined>();
  const { mutate: copyInputs, isLoading: isCopying } = useCopyInputs();
  const { data: currentPhase } = usePhase(currentPhaseid);

  const handleProjectFilter = useCallback(
    ({ value }: IOption) => {
      setSelectedProjectId(value);
      setNoOfInputs(undefined);
      setPhaseId(undefined);
    },
    [setSelectedProjectId]
  );

  const runCopyInputs = useCallback(
    (
      fromPhaseId: string,
      dryRun: boolean,
      onSuccess?: (response: IJob) => void
    ) => {
      copyInputs(
        {
          toPhaseId: currentPhaseid,
          fromPhaseId,
          dryRun,
        },
        onSuccess ? { onSuccess } : undefined
      );
    },
    [copyInputs, currentPhaseid]
  );

  const handlePhaseFilter = useCallback(({ value }: IOption) => {
    setPhaseId(value);
  }, []);

  useEffect(() => {
    if (phaseId) {
      runCopyInputs(phaseId, true, (response) => {
        setNoOfInputs(response.data.attributes.total);
      });
    }
  }, [phaseId, runCopyInputs]);

  const handleClose = useCallback(() => {
    setShowPastInputsModal(false);
  }, [setShowPastInputsModal]);

  const handleImport = useCallback(() => {
    if (!phaseId) return;
    runCopyInputs(phaseId, false);
    handleClose();
  }, [handleClose, phaseId, runCopyInputs]);

  const currentPhaseStartDate = currentPhase?.data.attributes.start_at;

  return (
    <Modal
      width={520}
      opened={showPastInputsModal}
      close={handleClose}
      header={formatMessage(messages.startFromPastInputs)}
    >
      <Box m="24px">
        <Text mb="12px" variant="bodyS" color="textSecondary">
          {formatMessage(messages.createInputsDescription)}
        </Text>
        <Box py="5px" mt="0px" alignItems="center">
          <Box mb="24px">
            <ProjectFilter
              selectedProjectId={selectedProjectId}
              emptyOptionMessage={messages.noProject}
              onProjectFilter={handleProjectFilter}
            />
          </Box>
          {selectedProjectId && (
            <PhaseFilter
              label={formatMessage(messages.selectAPhase)}
              projectId={selectedProjectId}
              phaseId={phaseId}
              participationMethods={['ideation', 'voting', 'common_ground']}
              onPhaseFilter={handlePhaseFilter}
              customPhaseFilter={
                selectedProjectId === currentProjectId && currentPhaseStartDate
                  ? (phases) =>
                      phases.filter(
                        (phase) =>
                          phase.attributes.start_at < currentPhaseStartDate
                      )
                  : undefined
              }
            />
          )}
        </Box>

        {typeof noOfInputs === 'number' && (
          <Box>
            <Text variant="bodyS" color="textSecondary">
              {formatMessage(messages.noOfInputsToImport, {
                count: noOfInputs,
              })}
            </Text>
          </Box>
        )}

        <Box mt="40px" display="flex" justifyContent="space-between">
          <Button buttonStyle="secondary-outlined" onClick={handleClose}>
            {formatMessage(messages.cancel)}
          </Button>
          <Button
            buttonStyle="admin-dark"
            disabled={!phaseId || isCopying || noOfInputs === 0}
            onClick={handleImport}
          >
            {formatMessage(messages.importInputs)}
          </Button>
        </Box>
      </Box>
    </Modal>
  );
};

export default ImportInputsModal;
