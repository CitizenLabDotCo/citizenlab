import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';
import { IUsers } from 'services/users';
import { IGroupMembershipsFoundUserData } from 'services/groupMemberships';

export interface IModeratorsFoundUsers {
  data: IGroupMembershipsFoundUserData[];
}

export function moderatorsStream(projectId: string) {
  return streams.get<IUsers>({
    apiEndpoint: `${API_PATH}/projects/${projectId}/moderators`,
  });
}

export async function deleteModerator(projectId: string, moderatorId: string) {
  const response = await streams.delete(
    `${API_PATH}/projects/${projectId}/moderators/${moderatorId}`,
    moderatorId
  );
  await streams.fetchAllWith({
    apiEndpoint: [`${API_PATH}/projects/${projectId}/moderators`],
  });
  return response;
}

export function findMembership(
  projectId: string,
  streamParams: IStreamParams | null = null
) {
  return streams.get<{ data: IGroupMembershipsFoundUserData[] }>({
    apiEndpoint: `${API_PATH}/projects/${projectId}/moderators/users_search`,
    ...streamParams,
    cacheStream: false,
  });
}

export function addMembership(projectId: string, user_id: string) {
  return streams.add(`${API_PATH}/projects/${projectId}/moderators`, {
    moderator: { user_id },
  });
}
