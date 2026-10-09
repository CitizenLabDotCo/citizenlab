import React from 'react';

import { Button, bo } from '@citizenlab/cl2-component-library';

import phaseSetupMessages from 'containers/Admin/projects/project/phaseSetup/messages';

import { useIntl } from 'utils/cl-intl';

import { usePageSave } from '../_shared/PageSaveContext';

interface Props {
  label?: string;
}

const SaveChangesButton = ({ label }: Props) => {
  const { formatMessage } = useIntl();
  const pageSave = usePageSave();

  if (!pageSave) return null;

  return (
    <Button
      buttonStyle="bo-primary"
      height={bo.buttonMedium.height}
      padding={bo.buttonMedium.padding}
      fontSize={bo.buttonMedium.fontSize}
      width="auto"
      disabled={!pageSave.dirty}
      processing={pageSave.saving}
      onClick={() => pageSave.saveAll('button')}
    >
      {label ?? formatMessage(phaseSetupMessages.saveChangesLabel)}
    </Button>
  );
};

export default SaveChangesButton;
