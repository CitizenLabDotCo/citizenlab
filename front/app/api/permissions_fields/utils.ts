import { isInitiativeAction } from 'api/initiative_action_descriptors/utils';

import {
  IPermissionCustomFieldUpdate,
  IPermissionsFieldAdd,
  PermissionsFieldUpdatePersisted,
} from './types';

export const isPersistedUpdate = (
  update: IPermissionCustomFieldUpdate
): update is PermissionsFieldUpdatePersisted => {
  return 'id' in update;
};

export const getPath = (parameters: IPermissionsFieldAdd): `/${string}` => {
  return isInitiativeAction(parameters.action)
    ? `/permissions/${parameters.action}/permissions_fields`
    : parameters.phaseId
    ? `/phases/${parameters.phaseId}/permissions/${parameters.action}/permissions_fields`
    : `/projects/${parameters.projectId}/permissions/${parameters.action}/permissions_fields`;
};
