import { IPermissionData } from 'api/permissions/types';

export type HandlePermissionChangeProps = {
  permission: IPermissionData;
  permittedBy?: IPermissionData['attributes']['permitted_by'];
  globalCustomFields?: IPermissionData['attributes']['global_custom_fields'];
  groupIds: string[];
  phaseId?: string | null;
};
