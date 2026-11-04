import React, { useState } from 'react';

import { Box, Button, Spinner } from '@citizenlab/cl2-component-library';

import usePhase from 'api/phases/usePhase';
import usePhases from 'api/phases/usePhases';

import SummaryPill from 'containers/Admin/projects/_shared/components/SummaryPill';

import FormInputEditWarningModal from 'components/admin/FormInputEditWarningModal';
import IconAction from 'components/UI/IconAction';

import { useIntl } from 'utils/cl-intl';

import PanelField from '../../../PanelField';
import AddInputModal from '../AddInputModal';
import methodSectionMessages from '../messages';
import useOpenInputForm from '../useOpenInputForm';
import useStagedInputs from '../useStagedInputs';

import InputImporterModal from './InputImporterModal';
import LinkPhaseIdeasModal from './LinkPhaseIdeasModal';
import messages from './messages';

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
                {saving && <Spinner size="14px" />}
                <SummaryPill
                  label={formatMessage(messages.nVotingOptions, { count })}
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

      <FormInputEditWarningModal
        variant="bo"
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
