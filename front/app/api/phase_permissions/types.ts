import { IPCPermissionAction, IRelationship } from 'typings';
import { Keys } from 'utils/cl-react-query/types';
import phasePermissionKeys from './keys';

export type PhasePermissionKeys = Keys<typeof phasePermissionKeys>;

export type IUpdatePermissionObject = {
  permissionId: string;
  phaseId: string;
  action: string;
  permission: Partial<IPermissionUpdate>;
};

export interface IPCPermissions {
  data: IPCPermissionData[];
}

export interface IPCPermission {
  data: IPCPermissionData;
}

export interface IPermissionUpdate {
  group_ids: string[];
  permitted_by: IPCPermissionData['attributes']['permitted_by'];
}
export interface IPCPermissionData {
  id: string;
  type: string;
  attributes: {
    action: IPCPermissionAction;
    permitted_by:
      | 'everyone'
      | 'users'
      | 'groups'
      | 'admins_moderators'
      | 'everyone_confirmed_email';
    created_at: string;
    updated_at: string;
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
