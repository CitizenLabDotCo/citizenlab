import React, { useState } from 'react';

import useCopyInputs from 'api/copy_inputs/useCopyInputs';
import usePhase from 'api/phases/usePhase';

import inputManagerMessages from 'components/admin/PostManager/CommonGroundInputManager/messages';

import Modal from 'design-system/Modal';

import { useIntl } from 'utils/cl-intl';

import PhaseSelect from '../PhaseSelect';

import styles from './CommonGroundSection.module.css';
import messages from './messages';
import ProjectComboBox from './ProjectComboBox';

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

  const handleProjectChange = (value: string | undefined) => {
    setFromProjectId(value);
    setFromPhaseId(undefined);
    setCount(undefined);
  };

  // A dry run of the copy is how the API reports how many inputs would move.
  const handlePhaseChange = (value: string) => {
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
      isOpen
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
      size={560}
      title={formatMessage(inputManagerMessages.importInputs)}
      secondaryAction={{
        label: formatMessage(inputManagerMessages.cancel),
        onPress: onClose,
      }}
      primaryAction={{
        label: formatMessage(inputManagerMessages.importInputs),
        isDisabled: !fromPhaseId || counting || !count,
        onPress: handleImport,
      }}
    >
      <div>
        <p className={styles.lead}>
          {formatMessage(inputManagerMessages.createInputsDescription)}
        </p>
        <div className={styles.projectField}>
          <ProjectComboBox
            label={formatMessage(messages.importProjectLabel)}
            placeholder={formatMessage(inputManagerMessages.selectAProject)}
            noProjectLabel={formatMessage(inputManagerMessages.noProject)}
            value={fromProjectId}
            onChange={handleProjectChange}
          />
        </div>
        {fromProjectId && (
          <div className={styles.phaseField}>
            <PhaseSelect
              label={formatMessage(messages.importPhaseLabel)}
              projectId={fromProjectId}
              phaseId={fromPhaseId}
              participationMethods={['ideation', 'voting', 'common_ground']}
              onChange={handlePhaseChange}
              data-cy="e2e-import-phase-select"
              filterPhases={
                fromProjectId === projectId && phaseStartDate
                  ? (phases) =>
                      phases.filter(
                        (candidate) =>
                          candidate.attributes.start_at < phaseStartDate
                      )
                  : undefined
              }
            />
          </div>
        )}
        {fromPhaseId && count !== undefined && (
          <p className={styles.helper}>
            {formatMessage(inputManagerMessages.noOfInputsToImport, { count })}
          </p>
        )}
      </div>
    </Modal>
  );
};

export default ImportInputsModal;
