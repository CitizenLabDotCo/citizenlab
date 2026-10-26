import React, { ReactNode } from 'react';

import { Box } from '@citizenlab/cl2-component-library';

import { IPhasePermissionAction } from 'api/permissions/types';

import PhaseActionAccess from './PhaseActionAccess';

interface Props {
  phaseId: string;
  action: IPhasePermissionAction;
  children: ReactNode;
}

const ToggleActionAccess = ({ phaseId, action, children }: Props) => (
  <Box
    display="flex"
    alignItems="center"
    justifyContent="space-between"
    gap="12px"
    minHeight="36px"
  >
    {children}
    <PhaseActionAccess phaseId={phaseId} action={action} />
  </Box>
);

export default ToggleActionAccess;
