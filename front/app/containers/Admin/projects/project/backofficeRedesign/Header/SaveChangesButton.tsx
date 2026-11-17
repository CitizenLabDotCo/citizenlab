import React, { useState } from 'react';

import phaseSetupMessages from 'containers/Admin/projects/project/phaseSetup/messages';

import { usePageSave } from 'components/admin/PageSaveContext';

import Button from 'design-system/Button';

import { useIntl } from 'utils/cl-intl';

import useReturnToPhaseAfterSave from '../_shared/useReturnToPhaseAfterSave';

import messages from './messages';
import 'design-system/tokens.css';

interface Props {
  label?: string;
}

const SaveChangesButton = ({ label }: Props) => {
  const { formatMessage } = useIntl();
  const pageSave = usePageSave();
  const returnToPhaseAfterSave = useReturnToPhaseAfterSave();
  const [saved, setSaved] = useState(false);

  if (!pageSave) return null;

  const handleClick = async () => {
    setSaved(false);
    const failed = await pageSave.saveAll('button');
    setSaved(failed.length === 0);
    returnToPhaseAfterSave(failed);
  };

  // A new edit makes the page dirty again, which brings the label back.
  const showSaved = saved && !pageSave.dirty && !pageSave.saving;

  return (
    <Button
      variant="primary"
      size={32}
      icon={showSaved ? 'check-14' : undefined}
      isDisabled={!pageSave.dirty}
      isPending={pageSave.saving}
      onPress={handleClick}
    >
      {showSaved
        ? formatMessage(messages.savedLabel)
        : label ?? formatMessage(phaseSetupMessages.saveChangesLabel)}
    </Button>
  );
};

export default SaveChangesButton;
