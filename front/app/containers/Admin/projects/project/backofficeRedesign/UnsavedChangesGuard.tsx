import React from 'react';

import { Box, Button, Text } from '@citizenlab/cl2-component-library';

import { usePageSave } from 'containers/Admin/projects/_shared/PageSaveContext';
import phaseSetupMessages from 'containers/Admin/projects/project/phaseSetup/messages';

import Modal from 'components/UI/Modal';

import { useIntl } from 'utils/cl-intl';
import { useBlocker } from 'utils/router';

import returnToPhaseAfterSave from './_shared/returnToPhaseAfterSave';
import messages from './messages';

const UnsavedChangesGuard = () => {
  const { formatMessage } = useIntl();
  const pageSave = usePageSave();
  const dirty = !!pageSave?.dirty;

  const blocker = useBlocker({
    shouldBlockFn: ({ current, next }) =>
      !pageSave?.isLeaving() && dirty && current.pathname !== next.pathname,
    enableBeforeUnload: dirty,
    withResolver: true,
  });

  if (!pageSave || blocker.status !== 'blocked') return null;

  const proceed = () => {
    pageSave.leave();
    blocker.proceed();
  };

  const handleSave = async () => {
    const failed = await pageSave.saveAll('leave');
    if (failed.length === 0) {
      proceed();
    } else {
      blocker.reset();
      returnToPhaseAfterSave(failed);
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
          <Button buttonStyle="bo-secondary" onClick={blocker.reset}>
            {formatMessage(messages.unsavedChangesCancel)}
          </Button>
          <Button
            buttonStyle="bo-secondary"
            onClick={() => {
              pageSave.discardAll();
              proceed();
            }}
          >
            {formatMessage(messages.discardChanges)}
          </Button>
          <Button
            buttonStyle="bo-primary"
            processing={pageSave.saving}
            onClick={handleSave}
          >
            {formatMessage(phaseSetupMessages.saveChangesLabel)}
          </Button>
        </Box>
      }
    >
      <Box p="24px">
        <Text variant="boHelper">
          {formatMessage(messages.unsavedChangesDescription2)}
        </Text>
      </Box>
    </Modal>
  );
};

export default UnsavedChangesGuard;
