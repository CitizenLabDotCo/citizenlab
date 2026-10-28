import React, { useState } from 'react';

import { Button } from '@citizenlab/cl2-component-library';

import { usePageSave } from 'containers/Admin/projects/_shared/PageSaveContext';
import phaseSetupMessages from 'containers/Admin/projects/project/phaseSetup/messages';

import { useIntl } from 'utils/cl-intl';
import { removeSearchParams } from 'utils/cl-router/removeSearchParams';

import messages from '../messages';

interface Props {
  label?: string;
}

const SaveChangesButton = ({ label }: Props) => {
  const { formatMessage } = useIntl();
  const pageSave = usePageSave();
  const [saved, setSaved] = useState(false);

  if (!pageSave) return null;

  const handleClick = async () => {
    setSaved(false);
    const saved = await pageSave.saveAll('button');
    setSaved(saved);
    // The errors show in the phase panel, which the map configuration covers.
    if (!saved) removeSearchParams(['map_config']);
  };

  // A new edit makes the page dirty again, which brings the label back.
  const showSaved = saved && !pageSave.dirty && !pageSave.saving;

  return (
    <Button
      buttonStyle="bo-primary"
      boSize="medium"
      width="auto"
      icon={showSaved ? 'check' : undefined}
      disabled={!pageSave.dirty}
      processing={pageSave.saving}
      onClick={handleClick}
    >
      {showSaved
        ? formatMessage(messages.savedLabel)
        : label ?? formatMessage(phaseSetupMessages.saveChangesLabel)}
    </Button>
  );
};

export default SaveChangesButton;
