import { IRelationship, Multiloc } from 'typings';

import {
  IPhasePermissionAction,
  IPhasePermissionData,
  PermittedBy,
} from 'api/phase_permissions/types';

import { Keys } from 'utils/cl-react-query/types';

import permissionsKeys from './keys';

export type PermissionsKeys = Keys<typeof permissionsKeys>;

export type IGlobalPermissionAction = 'following';

export interface IGlobalPermissionData {
  id: string;
  type: 'permission';
  attributes: {
    access_denied_explanation_multiloc: Multiloc;
    action: IGlobalPermissionAction;
    permitted_by: PermittedBy;
    created_at: string;
    updated_at: string;
    global_custom_fields: boolean;
    verification_enabled: boolean;
    verification_expiry: number | null;
    everyone_tracking_enabled: boolean;
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
  verification_expiry: number | null;
  access_denied_explanation_multiloc: Multiloc;
}
