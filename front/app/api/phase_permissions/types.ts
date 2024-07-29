import { IRelationship } from 'typings';

import {
  IGlobalPermissionAction,
  IPhasePermissionAction,
} from 'api/permissions/types';

import { Keys } from 'utils/cl-react-query/types';

import phasePermissionKeys from './keys';

export type PhasePermissionKeys = Keys<typeof phasePermissionKeys>;

export type IUpdatePermissionObject = {
  permissionId: string;
  phaseId: string;
  action: IGlobalPermissionAction | IPhasePermissionAction;
  permission: Partial<IPermissionUpdate>;
};

export type ResetPermissionObject = {
  permissionId: string;
  phaseId: string;
  action: IGlobalPermissionAction | IPhasePermissionAction;
};

export interface IPCPermissions {
  data: IPCPermissionData[];
}

export interface IPCPermission {
  data: IPCPermissionData;
}
export type PermittedBy =
  | 'everyone'
  | 'users'
  | 'groups' // soon to be deprecated, not used if `verified_actions` feature flag active
  | 'admins_moderators'
  | 'everyone_confirmed_email'
  | 'verified'; // new permitted_by type, only used if `verified_actions` feature flag active

export interface IPermissionUpdate {
  group_ids: string[];
  permitted_by: IPCPermissionData['attributes']['permitted_by'];
  global_custom_fields: boolean;
}
export interface IPCPermissionData {
  id: string;
  type: string;
  attributes: {
    action: IPhasePermissionAction;
    permitted_by: PermittedBy;
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
