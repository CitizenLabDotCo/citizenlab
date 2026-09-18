import React, { useEffect, useRef } from 'react';

import { Box, Button, Text } from '@citizenlab/cl2-component-library';

import phaseSetupMessages from 'containers/Admin/projects/project/phaseSetup/messages';

import Modal from 'components/UI/Modal';

import { useIntl } from 'utils/cl-intl';
import { useBlocker } from 'utils/router';

import { usePhaseSave } from './_shared/PhaseSaveContext';
import messages from './messages';

// Stops the admin from leaving a phase with unsaved changes. Only a change of
// page counts: filters and modals that only touch the search params don't.
const UnsavedChangesGuard = () => {
  const { formatMessage } = useIntl();
  const phaseSave = usePhaseSave();
  const dirty = !!phaseSave?.dirty;
  // Set once the admin chose to go: leaving can take more than one navigation
  // (the project URL redirects to its page) before the panels report clean.
  const leaving = useRef(false);

  useEffect(() => {
    if (!dirty) leaving.current = false;
  }, [dirty]);

  const blocker = useBlocker({
    shouldBlockFn: ({ current, next }) =>
      !leaving.current && dirty && current.pathname !== next.pathname,
    enableBeforeUnload: dirty,
    withResolver: true,
  });

  if (!phaseSave || blocker.status !== 'blocked') return null;

  const proceed = () => {
    leaving.current = true;
    blocker.proceed();
  };

  const handleSave = async () => {
    const saved = await phaseSave.saveAll('leave');
    if (saved) {
      proceed();
    } else {
      blocker.reset();
    }
  };

  return (
    <Modal
      opened
      close={blocker.reset}
      width={560}
      header={formatMessage(messages.unsavedChangesTitle)}
      footer={
        <Box display="flex" justifyContent="flex-end" gap="8px" width="100%">
          <Button buttonStyle="secondary-outlined" onClick={blocker.reset}>
            {formatMessage(messages.unsavedChangesCancel)}
          </Button>
          <Button
            buttonStyle="secondary-outlined"
            onClick={() => {
              phaseSave.discardAll();
              proceed();
            }}
          >
            {formatMessage(messages.discardChanges)}
          </Button>
          <Button
            buttonStyle="admin-dark"
            processing={phaseSave.saving}
            onClick={handleSave}
          >
            {formatMessage(phaseSetupMessages.saveChangesLabel)}
          </Button>
        </Box>
      }
    >
      <Box p="24px">
        <Text m="0">{formatMessage(messages.unsavedChangesDescription)}</Text>
      </Box>
    </Modal>
  );
};

export default UnsavedChangesGuard;
