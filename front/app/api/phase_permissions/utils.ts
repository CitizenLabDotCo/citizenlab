import { IPermissionData } from 'api/permissions/types';

import { IPhasePermissionData } from './types';

export const isPhasePermission = (
  permission: IPermissionData
): permission is IPhasePermissionData => {
  return permission.attributes.action !== 'following';
};
