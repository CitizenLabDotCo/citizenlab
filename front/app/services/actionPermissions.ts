import { IRelationship } from 'typings';

export type IGlobalPermissionAction =
  | 'voting_initiative'
  | 'commenting_initiative'
  | 'posting_initiative';

export interface IGlobalPermissionData {
  id: string;
  type: string;
  attributes: {
    action: IGlobalPermissionAction;
    permitted_by: 'everyone' | 'users' | 'groups' | 'admins_moderators';
    created_at: string;
    updated_at: string;
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
export type IPCPermissionAction =
  | 'voting_idea'
  | 'commenting_idea'
  | 'commenting_idea'
  | 'taking_survey'
  | 'taking_poll'
  | 'budgeting';
export interface IPCPermissionData {
  id: string;
  type: string;
  attributes: {
    action: IPCPermissionAction;
    permitted_by: 'everyone' | 'users' | 'groups' | 'admins_moderators';
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

export interface IPCPermissions {
  data: IPCPermissionData[];
}

export interface IGlobalPermissions {
  data: IGlobalPermissionData[];
}
