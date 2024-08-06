import { IRelationship } from 'typings';

import {
  IPhasePermissionAction,
  IPhasePermissionData,
  PermittedBy,
} from 'api/phase_permissions/types';

import { Keys } from 'utils/cl-react-query/types';

import permissionsKeys from './keys';

export type PermissionsKeys = Keys<typeof permissionsKeys>;

export type IGlobalPermissionAction =
  | 'reacting_initiative'
  | 'commenting_initiative'
  | 'posting_initiative'
  | 'following';

export interface IGlobalPermissionData {
  id: string;
  type: 'permission';
  attributes: {
    action: IGlobalPermissionAction;
    permitted_by: PermittedBy;
    created_at: string;
    updated_at: string;
    global_custom_fields: boolean;
  };
  relationships: {
    permission_scope: {
      data: null;
    };
    groups: {
      data: IRelationship[];
    };
  };
}

export type Action = IGlobalPermissionAction | IPhasePermissionAction;

export type IPermissionData = IPhasePermissionData | IGlobalPermissionData;

export interface IGlobalPermissions {
  data: IGlobalPermissionData[];
}

export interface IGlobalPermission {
  data: IGlobalPermissionData;
}

export interface PermissionUpdateParams {
  id: string;
  action: IGlobalPermissionAction;
  group_ids: string[];
  permitted_by: PermittedBy;
  global_custom_fields: boolean;
}

export type ResetPermissionParams = {
  permissionId: string;
  action: IGlobalPermissionAction;
};
