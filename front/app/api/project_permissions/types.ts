import { IRelationship } from 'typings';

import { IPhasePermissionAction } from 'api/phase_permissions/types';

import { Keys } from 'utils/cl-react-query/types';

import projectPermissionKeys from './keys';

export type ProjectPermissionKeys = Keys<typeof projectPermissionKeys>;

export interface IPCPermissions {
  data: IPhasePermissionData[];
}

export type IUpdatePermissionObject = {
  permissionId: string;
  projectId: string;
  action: string;
  permission: Partial<IPermissionUpdate>;
};

export interface IPCPermission {
  data: IPhasePermissionData;
}

export interface IPermissionUpdate {
  group_ids: string[];
  permitted_by?: IPhasePermissionData['attributes']['permitted_by'];
  global_custom_fields?: IPhasePermissionData['attributes']['global_custom_fields'];
}

export interface IPhasePermissionData {
  id: string;
  type: string;
  attributes: {
    action: IPhasePermissionAction;
    permitted_by:
      | 'everyone'
      | 'users'
      | 'admins_moderators'
      | 'everyone_confirmed_email'
      | 'verified';
    created_at: string;
    updated_at: string;
    global_custom_fields: boolean;
  };
  relationships: {
    permission_scope: {
      data: IRelationship;
    };
    groups: {
      data: IRelationship[];
    };
  };
}
