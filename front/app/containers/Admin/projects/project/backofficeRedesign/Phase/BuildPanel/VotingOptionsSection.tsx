import React, { useState } from 'react';

import { Box, Button, Spinner } from '@citizenlab/cl2-component-library';

import usePhase from 'api/phases/usePhase';
import usePhases from 'api/phases/usePhases';

import SummaryPill from 'containers/Admin/projects/_shared/components/SummaryPill';

import ImportInputsModal from 'components/admin/PostManager/CommonGroundInputManager/ImportInputsModal';
import IconAction from 'components/UI/IconAction';

import { useIntl } from 'utils/cl-intl';

import messages from '../../messages';

import AddInputModal from './AddInputModal';
import InputImporterModal from './InputImporterModal';
import PanelField from './PanelField';
import useOpenInputForm from './useOpenInputForm';
import useStagedInputs from './useStagedInputs';

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
  const { count, saving, importProgress, add, addImport } = useStagedInputs(
    projectId,
    phaseId
  );

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
  const editFormLabel = formatMessage(messages.editForm);
  const inputForm = useOpenInputForm(projectId, phaseId);
  const hasOptions = count > 0 || !!importProgress;

  return (
    <>
      <PanelField
        label={formatMessage(messages.votingOptionsSection)}
        action={
          <Box display="flex" alignItems="center" gap="4px">
            <IconAction
              icon="plus"
              tooltip={addLabel}
              ariaLabel={addLabel}
              onClick={() => setAddOpened(true)}
            />
            <IconAction
              icon="upload-file"
              tooltip={importLabel}
              ariaLabel={importLabel}
              onClick={() => setImporterOpened(true)}
            />
            {hasOptions &&
              (hasIdeationBefore ? (
                <IconAction
                  icon="clock"
                  tooltip={previousPhaseLabel}
                  ariaLabel={previousPhaseLabel}
                  disabled={!!importProgress}
                  onClick={() => setPreviousPhaseOpened(true)}
                />
              ) : (
                <IconAction
                  icon="edit"
                  tooltip={editFormLabel}
                  ariaLabel={editFormLabel}
                  disabled={!inputForm.ready}
                  onClick={inputForm.open}
                />
              ))}
            {hasOptions ? (
              <Box display="flex" alignItems="center" gap="6px">
                {(saving || importProgress) && <Spinner size="14px" />}
                <SummaryPill
                  label={
                    importProgress
                      ? formatMessage(messages.importingStatements, {
                          done: importProgress.done,
                          total: importProgress.total,
                        })
                      : formatMessage(messages.nVotingOptions, { count })
                  }
                />
              </Box>
            ) : (
              <Button
                buttonStyle="bo-primary"
                boSize="medium"
                width="auto"
                ml="4px"
                disabled={!hasIdeationBefore && !inputForm.ready}
                onClick={
                  hasIdeationBefore
                    ? () => setPreviousPhaseOpened(true)
                    : inputForm.open
                }
              >
                {hasIdeationBefore
                  ? previousPhaseLabel
                  : formatMessage(messages.createForm)}
              </Button>
            )}
          </Box>
        }
      />

      {inputForm.warningModal}

      {addOpened && (
        <AddInputModal
          phaseId={phaseId}
          kind="option"
          onSubmit={add}
          onClose={() => setAddOpened(false)}
        />
      )}

      <ImportInputsModal
        showPastInputsModal={previousPhaseOpened}
        setShowPastInputsModal={setPreviousPhaseOpened}
        currentPhaseid={phaseId}
        variant="bo"
        onImport={addImport}
      />

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
