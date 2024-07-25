import { IRelationship } from 'typings';

import { PermittedBy } from 'api/phase_permissions/types';

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
    permitted_by: 'everyone' | 'users' | 'groups' | 'admins_moderators';
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

export type IPhasePermissionAction =
  | 'posting_idea'
  | 'reacting_idea'
  | 'commenting_idea'
  | 'taking_survey'
  | 'taking_poll'
  | 'voting'
  | 'annotating_document';

export type Action = IGlobalPermissionAction | IPhasePermissionAction;

export interface IPhasePermissionData {
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

export type IPermissionData = IPhasePermissionData | IGlobalPermissionData;

export interface IPhasePermission {
  data: IPhasePermissionData;
}

export interface IGlobalPermissions {
  data: IGlobalPermissionData[];
}

export interface IPermissionUpdate {
  id: string;
  action: string;
  group_ids: string[];
  permitted_by: IPermissionData['attributes']['permitted_by'];
  global_custom_fields: boolean;
}
