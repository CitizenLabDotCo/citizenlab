import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';
import { IRelationship } from 'typings';

export interface IPermissionData {
  id: string;
  type: string;
  attributes: {
    action: 'vote', 'comment', 'post', 'take_survey';
    permitted_by: 'everyone' | 'groups' | 'admins_moderators',
    created_at: string,
    updated_at: string,
  };
  relationships: {
    permittable: {
      data: IRelationship;
    },
    groups: {
      data: IRelationship[];
    }
  };
}

export interface IPermission {
  data: IPermissionData;
}

export interface IPermissions {
  data: IPermissionData[];
}

export interface IPermissionUpdate {
  group_ids: string[];
  permitted_by: IPermissionData['attributes']['permitted_by'];
}

export function phasePermissions(projectId: string, phaseId: string, streamParams: IStreamParams | null = null) {
  return streams.get<IPermissions>({ apiEndpoint: `${API_PATH}/projects/${projectId}/phases/${phaseId}/permissions`, ...streamParams });
}

export function projectPermissions(projectId: string, streamParams: IStreamParams | null = null) {
  return streams.get<IPermissions>({ apiEndpoint: `${API_PATH}/projects/${projectId}/permissions`, ...streamParams });
}

export function updatePhasePermission(permissionId: string, projectId: string, phaseId: string, action: string, permission: Partial<IPermissionUpdate>) {
  return streams.update<IPermission>(`${API_PATH}/projects/${projectId}/phases/${phaseId}/permissions/${action}`, permissionId, { permission });
}

export function updateProjectPermission(permissionId: string, projectId: string, action: string, permission: Partial<IPermissionUpdate>) {
  return streams.update<IPermission>(`${API_PATH}/projects/${projectId}/permissions/${action}`, permissionId, { permission });
}
