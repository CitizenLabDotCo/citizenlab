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
    confirmed_email_expiry: number | null;
    created_at: string;
    everyone_tracking_enabled: boolean;
    global_custom_fields: boolean;
    permitted_by: PermittedBy;
    permitted_by_everyone_allowed: false;
    require_confirmed_email: boolean;
    require_confirmed_phone_number: boolean;
    confirmed_phone_number_expiry: number | null;
    require_name: boolean;
    require_password: boolean;
    require_verification: boolean;
    updated_at: string;
    verification_enabled: boolean;
    verification_expiry: number | null;
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
  require_confirmed_email: boolean;
  confirmed_email_expiry: number | null;
  require_confirmed_phone_number: boolean;
  confirmed_phone_number_expiry: number | null;
  require_name: boolean;
  require_password: boolean;
  require_verification: boolean;
}
