import React from 'react';

import { useController, useForm } from 'react-hook-form';

import Modal from 'design-system/Modal';

import useCopyInputs from 'api/copy_inputs/useCopyInputs';
import usePhase from 'api/phases/usePhase';

import inputManagerMessages from 'components/admin/PostManager/CommonGroundInputManager/messages';

import { useIntl } from 'utils/cl-intl';

import PhaseSelect from '../PhaseSelect';

import styles from './CommonGroundSection.module.css';
import messages from './messages';
import ProjectComboBox from './ProjectComboBox';

interface FormValues {
  fromProjectId?: string;
  fromPhaseId?: string;
}

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
  const { control, handleSubmit, setValue } = useForm<FormValues>();
  const { field: projectField } = useController({
    control,
    name: 'fromProjectId',
  });
  const { field: phaseField } = useController({ control, name: 'fromPhaseId' });
  // A dry run of the copy is how the API reports how many inputs would move.
  const {
    mutate: countInputs,
    data: dryRun,
    isPending: counting,
    reset: resetCount,
  } = useCopyInputs();
  const { data: phase } = usePhase(phaseId);

  const fromProjectId = projectField.value;
  const fromPhaseId = phaseField.value;
  const count = dryRun?.data.attributes.total;
  const phaseStartDate = phase?.data.attributes.start_at;

  const handleProjectChange = (value: string | undefined) => {
    projectField.onChange(value);
    setValue('fromPhaseId', undefined);
    resetCount();
  };

  const handlePhaseChange = (value: string) => {
    phaseField.onChange(value);
    countInputs({ toPhaseId: phaseId, fromPhaseId: value, dryRun: true });
  };

  const handleImport = handleSubmit(({ fromPhaseId }) => {
    if (!fromPhaseId || count === undefined) return;
    onImport(fromPhaseId, count);
    onClose();
  });

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
        onPress: () => handleImport(),
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
