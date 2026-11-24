import React from 'react';

import Button from 'design-system/Button';
import Modal from 'design-system/Modal';
import Text from 'design-system/Text';

import phaseSetupMessages from 'containers/Admin/projects/project/phaseSetup/messages';

import { usePageSave } from 'components/admin/PageSaveContext';

import { useIntl } from 'utils/cl-intl';
import { useBlocker } from 'utils/router';

import useReturnToPhaseAfterSave from './_shared/useReturnToPhaseAfterSave';
import publishMessages from './Header/PublishDropdown/messages';
import messages from './messages';

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
    <Modal
      isOpen
      onOpenChange={(isOpen) => !isOpen && blocker.reset()}
      size={560}
      title={formatMessage(messages.unsavedChangesTitle)}
      leadingAction={
        <Button
          variant="quiet"
          isDisabled={pageSave.saving}
          onPress={() => {
            pageSave.discardAll();
            proceed();
          }}
        >
          {formatMessage(messages.discardChanges)}
        </Button>
      }
      secondaryAction={{ label: formatMessage(publishMessages.publishCancel) }}
      primaryAction={{
        label: formatMessage(phaseSetupMessages.saveChangesLabel),
        isPending: pageSave.saving,
        onPress: handleSave,
      }}
    >
      <Text variant="ui" tone="secondary">
        {formatMessage(messages.unsavedChangesDescription2)}
      </Text>
    </Modal>
  );
};

export default UnsavedChangesGuard;
