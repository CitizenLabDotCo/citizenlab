import React, { useEffect, useRef } from 'react';

import { Box, Button, Text } from '@citizenlab/cl2-component-library';

import phaseSetupMessages from 'containers/Admin/projects/project/phaseSetup/messages';

import Modal from 'components/UI/Modal';

import { useIntl } from 'utils/cl-intl';
import { useBlocker } from 'utils/router';

import { usePageSave } from './_shared/PageSaveContext';
import messages from './messages';

const UnsavedChangesGuard = () => {
  const { formatMessage } = useIntl();
  const pageSave = usePageSave();
  const dirty = !!pageSave?.dirty;
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

  if (!pageSave || blocker.status !== 'blocked') return null;

  const proceed = () => {
    leaving.current = true;
    blocker.proceed();
  };

  const handleSave = async () => {
    const saved = await pageSave.saveAll('leave');
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
