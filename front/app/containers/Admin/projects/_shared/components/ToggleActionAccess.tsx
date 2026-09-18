import React from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import { IPhasePermissionAction } from 'api/permissions/types';

import PhaseActionAccess from './PhaseActionAccess';

interface Props {
  phaseId: string;
  action: IPhasePermissionAction;
}

// Placed right under an action's toggle, lined up with the toggle's label.
const ToggleActionAccess = ({ phaseId, action }: Props) => (
  <Box mt="-6px" mb="12px" ml="52px">
    <PhaseActionAccess phaseId={phaseId} action={action} />
  </Box>
);

export default ToggleActionAccess;
