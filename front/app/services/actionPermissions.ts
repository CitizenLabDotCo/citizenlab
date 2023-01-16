import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';
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

export type IPermissionData = IPCPermissionData | IGlobalPermissionData;

export interface IPCPermission {
  data: IPCPermissionData;
}

export interface IPCPermissions {
  data: IPCPermissionData[];
}

export interface IGlobalPermissions {
  data: IGlobalPermissionData[];
}

export function phasePermissions(
  phaseId: string,
  streamParams: IStreamParams | null = null
) {
  return streams.get<IPCPermissions>({
    apiEndpoint: `${API_PATH}/phases/${phaseId}/permissions`,
    ...streamParams,
  });
}

export function projectPermissions(
  projectId: string,
  streamParams: IStreamParams | null = null
) {
  return streams.get<IPCPermissions>({
    apiEndpoint: `${API_PATH}/projects/${projectId}/permissions`,
    ...streamParams,
  });
}

export function globalPermissions(streamParams: IStreamParams | null = null) {
  return streams.get<IGlobalPermissions>({
    apiEndpoint: `${API_PATH}/permissions`, // or `${API_PATH}/action_descriptors/initiatives`
    ...streamParams,
  });
}
