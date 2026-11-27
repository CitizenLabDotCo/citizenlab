import React, { useState } from 'react';

import Button from 'design-system/Button';
import IconButton from 'design-system/IconButton';
import Spinner from 'design-system/Spinner';

import usePhase from 'api/phases/usePhase';
import usePhases from 'api/phases/usePhases';

import FormInputEditWarningModal from 'components/admin/FormInputEditWarningModal';

import { useIntl } from 'utils/cl-intl';

import PanelField from '../../../PanelField';
import AddInputModal from '../AddInputModal';
import methodSectionMessages from '../messages';
import useOpenInputForm from '../useOpenInputForm';
import useStagedInputs from '../useStagedInputs';

import InputImporterModal from './InputImporterModal';
import LinkPhaseIdeasModal from './LinkPhaseIdeasModal';
import messages from './messages';
import styles from './VotingOptionsSection.module.css';

interface Props {
  projectId: string;
  phaseId: string;
}

const VotingOptionsSection = ({ projectId, phaseId }: Props) => {
  const { formatMessage } = useIntl();
  const [addOpened, setAddOpened] = useState(false);
  const [previousPhaseOpened, setPreviousPhaseOpened] = useState(false);
  const [importerOpened, setImporterOpened] = useState(false);
  const { data: phase } = usePhase(phaseId);
  const { data: phases } = usePhases(projectId);
  const { count, saving, add, addLinks } = useStagedInputs(projectId, phaseId);

  // An ideation phase earlier in the timeline is where options usually come
  // from; without one, they're collected through the form.
  const startAt = phase?.data.attributes.start_at;
  const hasIdeationBefore = !!phases?.data.some(
    ({ attributes }) =>
      attributes.participation_method === 'ideation' &&
      !!startAt &&
      attributes.start_at < startAt
  );

  const addLabel = formatMessage(messages.addVotingOption);
  const importLabel = formatMessage(messages.importVotingOptions);
  const previousPhaseLabel = formatMessage(messages.importFromPreviousPhase);
  const editFormLabel = formatMessage(methodSectionMessages.editForm);
  const inputForm = useOpenInputForm(projectId, phaseId);
  const hasOptions = count > 0;

  return (
    <>
      <PanelField
        label={formatMessage(messages.votingOptionsSection)}
        hasButtons={!hasOptions}
        action={
          <div className={styles.actions}>
            <IconButton
              icon="plus-16"
              aria-label={addLabel}
              onPress={() => setAddOpened(true)}
            />
            <IconButton
              icon="upload-16"
              aria-label={importLabel}
              onPress={() => setImporterOpened(true)}
            />
            {hasOptions ? (
              <>
                <IconButton
                  icon="square-pen-16"
                  aria-label={editFormLabel}
                  isDisabled={!inputForm.ready}
                  onPress={inputForm.open}
                />
                {saving && <Spinner />}
              </>
            ) : (
              <div className={styles.primaryAction}>
                <Button
                  variant="primary"
                  isDisabled={!hasIdeationBefore && !inputForm.ready}
                  onPress={
                    hasIdeationBefore
                      ? () => setPreviousPhaseOpened(true)
                      : inputForm.open
                  }
                >
                  {hasIdeationBefore
                    ? previousPhaseLabel
                    : formatMessage(messages.createForm)}
                </Button>
              </div>
            )}
          </div>
        }
      />

      <FormInputEditWarningModal
        variant="panel"
        showEditWarningModal={inputForm.warningOpened}
        setShowEditWarningModal={inputForm.setWarningOpened}
        editFormLink={inputForm.editFormLink}
      />

      {addOpened && (
        <AddInputModal
          phaseId={phaseId}
          kind="option"
          onSubmit={add}
          onClose={() => setAddOpened(false)}
        />
      )}

      {previousPhaseOpened && (
        <LinkPhaseIdeasModal
          projectId={projectId}
          phaseId={phaseId}
          onLink={addLinks}
          onClose={() => setPreviousPhaseOpened(false)}
        />
      )}

      <InputImporterModal
        projectId={projectId}
        phaseId={phaseId}
        opened={importerOpened}
        onClose={() => setImporterOpened(false)}
      />
    </>
  );
};

export default VotingOptionsSection;
