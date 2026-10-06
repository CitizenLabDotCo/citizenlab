import React from 'react';

import { Button, bo } from '@citizenlab/cl2-component-library';

import phaseSetupMessages from 'containers/Admin/projects/project/phaseSetup/messages';

import { useIntl } from 'utils/cl-intl';

import { usePhaseSave } from '../_shared/PhaseSaveContext';

const SaveChangesButton = () => {
  const { formatMessage } = useIntl();
  const phaseSave = usePhaseSave();

  if (!phaseSave) return null;

  return (
    <Button
      buttonStyle="bo-primary"
      height={bo.buttonMedium.height}
      padding={bo.buttonMedium.padding}
      fontSize={bo.buttonMedium.fontSize}
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
