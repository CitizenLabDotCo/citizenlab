import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';
import { IPCPermissionAction, IRelationship } from 'typings';

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

export type IPermissionData = IPCPermissionData | IGlobalPermissionData;

export interface IPCPermission {
  data: IPCPermissionData;
}

export interface IGlobalPermissions {
  data: IGlobalPermissionData[];
}

export interface IPermissionUpdate {
  group_ids: string[];
  permitted_by: IPermissionData['attributes']['permitted_by'];
  global_custom_fields: boolean;
}

export function globalPermissions(streamParams: IStreamParams | null = null) {
  return streams.get<IGlobalPermissions>({
    apiEndpoint: `${API_PATH}/permissions`, // or `${API_PATH}/action_descriptors/initiatives`
    ...streamParams,
  });
}

export function updateGlobalPermission(
  permissionId: string,
  action: string,
  permission: Partial<IPermissionUpdate>
) {
  return streams.update<IPCPermission>(
    `${API_PATH}/permissions/${action}`,
    permissionId,
    { permission }
  );
}
