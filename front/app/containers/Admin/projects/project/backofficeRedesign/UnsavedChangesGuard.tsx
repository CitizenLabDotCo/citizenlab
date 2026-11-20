import React from 'react';

import Modal from 'design-system/Modal';

import phaseSetupMessages from 'containers/Admin/projects/project/phaseSetup/messages';

import { usePageSave } from 'components/admin/PageSaveContext';

import { useIntl } from 'utils/cl-intl';
import { useBlocker } from 'utils/router';

import useReturnToPhaseAfterSave from './_shared/useReturnToPhaseAfterSave';
import messages from './messages';
import styles from './UnsavedChangesGuard.module.css';

const UnsavedChangesGuard = () => {
  const { formatMessage } = useIntl();
  const pageSave = usePageSave();
  const returnToPhaseAfterSave = useReturnToPhaseAfterSave();
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
    // The close button cancels: Modal has room for two footer actions only.
    <Modal
      isOpen
      onOpenChange={(isOpen) => !isOpen && blocker.reset()}
      size={560}
      title={formatMessage(messages.unsavedChangesTitle)}
      secondaryAction={{
        label: formatMessage(messages.discardChanges),
        onPress: () => {
          pageSave.discardAll();
          proceed();
        },
      }}
      primaryAction={{
        label: formatMessage(phaseSetupMessages.saveChangesLabel),
        isPending: pageSave.saving,
        onPress: handleSave,
      }}
    >
      <p className={styles.text}>
        {formatMessage(messages.unsavedChangesDescription2)}
      </p>
    </Modal>
  );
};

export default UnsavedChangesGuard;
