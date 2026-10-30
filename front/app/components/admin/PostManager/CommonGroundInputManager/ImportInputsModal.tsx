import React, { useCallback, useEffect, useState } from 'react';

import { Box, Button, Text } from '@citizenlab/cl2-component-library';
import { IOption } from 'typings';

import useCopyInputs from 'api/copy_inputs/useCopyInputs';
import { IJob } from 'api/jobs/types';
import usePhase from 'api/phases/usePhase';

import Modal from 'components/UI/Modal';
import PhaseFilter from 'components/UI/PhaseFilter';
import ProjectFilter from 'components/UI/ProjectFilter';

import { useIntl } from 'utils/cl-intl';
import { useParams } from 'utils/router';

import messages from './messages';

interface Props {
  showPastInputsModal: boolean;
  setShowPastInputsModal: (show: boolean) => void;
  currentPhaseid: string;
  variant?: 'bo';
  /** When set, the import is handed back to run later instead of now. */
  onImport?: (fromPhaseId: string, count: number) => void;
}

const ImportInputsModal = ({
  showPastInputsModal,
  setShowPastInputsModal,
  currentPhaseid,
  variant,
  onImport,
}: Props) => {
  const { projectId: currentProjectId } = useParams({ strict: false });
  const { formatMessage } = useIntl();
  const [selectedProjectId, setSelectedProjectId] = useState<
    string | undefined
  >();
  const [phaseId, setPhaseId] = useState<string | undefined>();
  const [noOfInputs, setNoOfInputs] = useState<number | undefined>();
  const { mutate: copyInputs, isPending: isCopying } = useCopyInputs();
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

  // The modal stays mounted, so it starts over by clearing its choices.
  const handleClose = useCallback(() => {
    setShowPastInputsModal(false);
    setSelectedProjectId(undefined);
    setPhaseId(undefined);
    setNoOfInputs(undefined);
  }, [setShowPastInputsModal]);

  const handleImport = useCallback(() => {
    if (!phaseId || noOfInputs === undefined) return;
    if (onImport) {
      onImport(phaseId, noOfInputs);
    } else {
      runCopyInputs(phaseId, false);
    }
    handleClose();
  }, [handleClose, noOfInputs, onImport, phaseId, runCopyInputs]);

  const currentPhaseStartDate = currentPhase?.data.attributes.start_at;
  const isBo = variant === 'bo';
  const importDisabled = !phaseId || isCopying || !noOfInputs;

  const fields = (
    <>
      <Box mb="24px">
        {isBo && (
          <Text variant="boHelper" fontSize="xs" m="0" mb="4px">
            {formatMessage(messages.projectLabel)}
          </Text>
        )}
        <ProjectFilter
          selectedProjectId={selectedProjectId}
          emptyOptionMessage={messages.noProject}
          onProjectFilter={handleProjectFilter}
          placeholder={
            isBo ? formatMessage(messages.selectAProject) : undefined
          }
          variant={variant}
        />
      </Box>
      {selectedProjectId && (
        <PhaseFilter
          label={formatMessage(
            isBo ? messages.phaseLabel : messages.selectAPhase
          )}
          projectId={selectedProjectId}
          phaseId={phaseId}
          participationMethods={['ideation', 'voting', 'common_ground']}
          onPhaseFilter={handlePhaseFilter}
          customPhaseFilter={
            selectedProjectId === currentProjectId && currentPhaseStartDate
              ? (phases) =>
                  phases.filter(
                    (phase) => phase.attributes.start_at < currentPhaseStartDate
                  )
              : undefined
          }
          variant={variant}
        />
      )}
    </>
  );

  const inputsCount = !!phaseId && noOfInputs !== undefined && (
    <Text
      variant={isBo ? 'boHelper' : 'bodyS'}
      color={isBo ? undefined : 'textSecondary'}
      m="0"
    >
      {formatMessage(messages.noOfInputsToImport, { count: noOfInputs })}
    </Text>
  );

  if (isBo) {
    return (
      <Modal
        width={560}
        variant="bo"
        opened={showPastInputsModal}
        close={handleClose}
        header={formatMessage(messages.importInputs)}
        footer={
          <Box display="flex" justifyContent="flex-end" gap="8px" width="100%">
            <Button buttonStyle="bo-secondary" onClick={handleClose}>
              {formatMessage(messages.cancel)}
            </Button>
            <Button
              buttonStyle="bo-primary"
              disabled={importDisabled}
              onClick={handleImport}
            >
              {formatMessage(messages.importInputs)}
            </Button>
          </Box>
        }
      >
        <Box p="24px">
          <Text variant="boLabel" m="0" mb="16px">
            {formatMessage(messages.createInputsDescription)}
          </Text>
          {fields}
          {inputsCount}
        </Box>
      </Modal>
    );
  }

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
          {fields}
        </Box>

        {inputsCount && <Box>{inputsCount}</Box>}

        <Box mt="40px" display="flex" justifyContent="space-between">
          <Button buttonStyle="secondary-outlined" onClick={handleClose}>
            {formatMessage(messages.cancel)}
          </Button>
          <Button
            buttonStyle="admin-dark"
            disabled={importDisabled}
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
