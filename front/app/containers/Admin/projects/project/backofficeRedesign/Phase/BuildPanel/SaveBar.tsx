import React from 'react';

import { Box, colors } from '@citizenlab/cl2-component-library';

import phaseSetupMessages from 'containers/Admin/projects/project/phaseSetup/messages';
import { SubmitStateType } from 'containers/Admin/projects/project/phaseSetup/typings';

import SubmitWrapper from 'components/admin/SubmitWrapper';

interface Props {
  status: SubmitStateType;
  loading: boolean;
  onClick: () => void;
}

const SaveBar = ({ status, loading, onClick }: Props) => (
  <Box
    position="sticky"
    bottom="0"
    px="20px"
    py="12px"
    background={colors.white}
    borderTop={`1px solid ${colors.grey200}`}
    className="intercom-phase-save-button"
  >
    <SubmitWrapper
      onClick={onClick}
      loading={loading}
      status={status}
      messages={{
        buttonSave: phaseSetupMessages.saveChangesLabel,
        buttonSuccess: phaseSetupMessages.saveSuccessLabel,
        messageError: phaseSetupMessages.saveErrorMessage,
        messageSuccess: phaseSetupMessages.saveSuccessMessage,
      }}
    />
  </Box>
);

export default SaveBar;
