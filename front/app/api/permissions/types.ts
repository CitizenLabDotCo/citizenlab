import { IRelationship } from 'typings';
import permissionsKeys from './keys';
import { Keys } from 'utils/cl-react-query/types';

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

export type IParticipationContextPermissionAction =
  | 'posting_idea'
  | 'reacting_idea'
  | 'commenting_idea'
  | 'taking_survey'
  | 'taking_poll'
  | 'voting'
  | 'annotating_document';

export interface IParticipationContextPermissionData {
  id: string;
  type: string;
  attributes: {
    action: IParticipationContextPermissionAction;
    permitted_by:
      | 'everyone'
      | 'users'
      | 'groups'
      | 'admins_moderators'
      | 'everyone_confirmed_email';
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

export type IPermissionData =
  | IParticipationContextPermissionData
  | IGlobalPermissionData;

export interface IParticipationContextPermission {
  data: IParticipationContextPermissionData;
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
