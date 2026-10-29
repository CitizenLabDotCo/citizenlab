import React, { ReactNode } from 'react';

import { IPhasePermissionAction } from 'api/permissions/types';

import ToggleActionAccess from 'containers/Admin/projects/_shared/components/ToggleActionAccess';

import { ToggleRow } from '../../shared/styling';

interface Props {
  /** Only set in the workspace panel, which shows each action's access. */
  phaseId?: string;
  action: IPhasePermissionAction;
  last?: boolean;
  error?: ReactNode;
  children: ReactNode;
}

const ActionToggleRow = ({ phaseId, action, last, error, children }: Props) => {
  if (!phaseId) {
    return (
      <ToggleRow className={last ? 'last' : undefined}>
        {children}
        {error}
      </ToggleRow>
    );
  }

  return (
    <>
      <ToggleActionAccess phaseId={phaseId} action={action}>
        {children}
      </ToggleActionAccess>
      {error}
    </>
  );
};

export default ActionToggleRow;
