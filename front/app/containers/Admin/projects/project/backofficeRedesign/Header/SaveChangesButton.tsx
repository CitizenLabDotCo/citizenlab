import React from 'react';

import { Button } from '@citizenlab/cl2-component-library';

import phaseSetupMessages from 'containers/Admin/projects/project/phaseSetup/messages';

import { useIntl } from 'utils/cl-intl';

import { usePhaseSave } from '../_shared/PhaseSaveContext';

const SaveChangesButton = () => {
  const { formatMessage } = useIntl();
  const phaseSave = usePhaseSave();

  if (!phaseSave) return null;

  return (
    <Button
      buttonStyle="admin-dark"
      size="s"
      padding="4px 8px"
      width="auto"
      disabled={!phaseSave.dirty}
      processing={phaseSave.saving}
      onClick={() => phaseSave.saveAll('button')}
    >
      {formatMessage(phaseSetupMessages.saveChangesLabel)}
    </Button>
  );
};

export default SaveChangesButton;
