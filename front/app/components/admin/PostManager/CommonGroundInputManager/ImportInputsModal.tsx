import React, { useCallback, useEffect, useState } from 'react';

import { Text, Box, Button } from '@citizenlab/cl2-component-library';
import { IOption } from 'typings';

import { IJob } from 'api/copy_inputs/types';
import useCopyInputs from 'api/copy_inputs/useCopyInputs';

import ProjectFilter from 'containers/Admin/reporting/components/ReportBuilder/Widgets/_shared/ProjectFilter';

import Modal from 'components/UI/Modal';
import PhaseFilter from 'components/UI/PhaseFilter';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

type Props = {
  showPastInputsModal: boolean;
  setShowPastInputsModal: (show: boolean) => void;
  currentPhaseid: string;
};

const ImportInputsModal = ({
  showPastInputsModal,
  setShowPastInputsModal,
  currentPhaseid,
}: Props) => {
  const { formatMessage } = useIntl();
  const [projectId, setProjectId] = useState<string | undefined>();
  const [phaseId, setPhaseId] = useState<string | undefined>();
  const [noOfInputs, setNoOfInputs] = useState<number | undefined>();
  const { mutate: copyInputs, isLoading: isCopying } = useCopyInputs();

  const handleProjectFilter = useCallback(
    ({ value }: IOption) => {
      setProjectId(value);
      setNoOfInputs(undefined);
      setPhaseId(undefined);
    },
    [setProjectId]
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

  return (
    <Modal
      width={520}
      opened={showPastInputsModal}
      close={handleClose}
      header={formatMessage(messages.startFromPastInputs)}
    >
      <Box m="24px" data-cy="e2e-copy-survey-modal">
        <Text mb="12px" variant="bodyS" color="textSecondary">
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
