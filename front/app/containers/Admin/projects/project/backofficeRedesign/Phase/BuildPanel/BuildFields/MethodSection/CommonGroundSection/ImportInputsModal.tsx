import React, { useState } from 'react';

import { Box, Button, Text } from '@citizenlab/cl2-component-library';
import { IOption } from 'typings';

import useCopyInputs from 'api/copy_inputs/useCopyInputs';
import usePhase from 'api/phases/usePhase';

import inputManagerMessages from 'components/admin/PostManager/CommonGroundInputManager/messages';
import Modal from 'components/UI/Modal';
import PhaseFilter from 'components/UI/PhaseFilter';
import ProjectFilter from 'components/UI/ProjectFilter';

import { useIntl } from 'utils/cl-intl';

import messages from './messages';

interface Props {
  projectId: string;
  phaseId: string;
  onImport: (fromPhaseId: string, count: number) => void;
  onClose: () => void;
}

const ImportInputsModal = ({
  projectId,
  phaseId,
  onImport,
  onClose,
}: Props) => {
  const { formatMessage } = useIntl();
  const [fromProjectId, setFromProjectId] = useState<string>();
  const [fromPhaseId, setFromPhaseId] = useState<string>();
  const [count, setCount] = useState<number>();
  const { mutate: copyInputs, isPending: counting } = useCopyInputs();
  const { data: phase } = usePhase(phaseId);

  const phaseStartDate = phase?.data.attributes.start_at;

  const handleProjectFilter = ({ value }: IOption) => {
    setFromProjectId(value);
    setFromPhaseId(undefined);
    setCount(undefined);
  };

  // A dry run of the copy is how the API reports how many inputs would move.
  const handlePhaseFilter = ({ value }: IOption) => {
    setFromPhaseId(value);
    setCount(undefined);
    copyInputs(
      { toPhaseId: phaseId, fromPhaseId: value, dryRun: true },
      {
        onSuccess: (job) => {
          setCount(job.data.attributes.total);
        },
      }
    );
  };

  const handleImport = () => {
    if (!fromPhaseId || count === undefined) return;
    onImport(fromPhaseId, count);
    onClose();
  };

  return (
    <Modal
      opened
      close={onClose}
      width={560}
      variant="bo"
      header={formatMessage(inputManagerMessages.importInputs)}
      footer={
        <Box display="flex" justifyContent="flex-end" gap="8px" width="100%">
          <Button buttonStyle="bo-secondary" onClick={onClose}>
            {formatMessage(inputManagerMessages.cancel)}
          </Button>
          <Button
            buttonStyle="bo-primary"
            disabled={!fromPhaseId || counting || !count}
            onClick={handleImport}
          >
            {formatMessage(inputManagerMessages.importInputs)}
          </Button>
        </Box>
      }
    >
      <Box p="24px">
        <Text variant="boLabel" m="0" mb="16px">
          {formatMessage(inputManagerMessages.createInputsDescription)}
        </Text>
        <Box mb="24px">
          <Text variant="boHelper" fontSize="xs" m="0" mb="4px">
            {formatMessage(messages.importProjectLabel)}
          </Text>
          <ProjectFilter
            selectedProjectId={fromProjectId}
            emptyOptionMessage={inputManagerMessages.noProject}
            onProjectFilter={handleProjectFilter}
            placeholder={formatMessage(inputManagerMessages.selectAProject)}
            variant="bo"
          />
        </Box>
        {fromProjectId && (
          <PhaseFilter
            label={formatMessage(messages.importPhaseLabel)}
            projectId={fromProjectId}
            phaseId={fromPhaseId}
            participationMethods={['ideation', 'voting', 'common_ground']}
            onPhaseFilter={handlePhaseFilter}
            customPhaseFilter={
              fromProjectId === projectId && phaseStartDate
                ? (phases) =>
                    phases.filter(
                      (candidate) =>
                        candidate.attributes.start_at < phaseStartDate
                    )
                : undefined
            }
            variant="bo"
          />
        )}
        {fromPhaseId && count !== undefined && (
          <Text variant="boHelper" m="0">
            {formatMessage(inputManagerMessages.noOfInputsToImport, { count })}
          </Text>
        )}
      </Box>
    </Modal>
  );
};

export default ImportInputsModal;
