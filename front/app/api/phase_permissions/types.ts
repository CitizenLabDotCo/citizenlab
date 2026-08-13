import { Action, IPermissionUpdate } from 'api/permissions/types';

import { Keys } from 'utils/cl-react-query/types';

import phasePermissionKeys from './keys';

export type PhasePermissionKeys = Keys<typeof phasePermissionKeys>;

export type UpdatePermissionParams = {
  permissionId: string;
  phaseId: string;
  action: Action;
  permission: Partial<IPermissionUpdate>;
};

export type ResetPermissionParams = {
  permissionId: string;
  phaseId: string;
  action: Action;
};
