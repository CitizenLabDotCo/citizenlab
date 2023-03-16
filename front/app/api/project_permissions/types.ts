import { Keys } from 'utils/cl-react-query/types';
import eventsKeys from './keys';
import { IRelationship } from 'typings';

export type EventsKeys = Keys<typeof eventsKeys>;

export interface IPCPermissions {
  data: IPCPermissionData[];
}

export type IUpdatePermissionObject = {
  permissionId: string;
  projectId: string;
  action: string;
  permission: Partial<IPermissionUpdate>;
};

export interface IPCPermission {
  data: IPCPermissionData;
}

export interface IPermissionUpdate {
  group_ids: string[];
  permitted_by: IPCPermissionData['attributes']['permitted_by'];
}

export type IPCPermissionAction =
  | 'posting_idea'
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

export type PermissionType = IPCPermissionData[] | undefined | null | Error;
