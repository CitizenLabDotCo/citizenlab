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

// Switching an action between following the global 'visiting' permission and
// owning its own. Keyed by action only: while inherited there is no permission
// record, so there is no id to send.
export type InheritancePermissionParams = {
  phaseId: string;
  action: Action;
};
