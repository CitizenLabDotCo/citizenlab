import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';
import { IUsers } from 'services/users';
import { API } from 'typings';

export interface FoundUser {
  id: string;
  type: 'users';
  attributes: {
    first_name: string;
    last_name: string;
    slug: string;
    avatar: API.ImageSizes;
    is_moderator: boolean;
    email: string;
  };
}

export function moderatorsStream(projectId: string) {
  return streams.get<IUsers>({ apiEndpoint: `${API_PATH}/projects/${projectId}/moderators` });
}

export async function deleteModerator(projectId: string, moderatorId: string) {
  return streams.delete(`${API_PATH}/projects/${projectId}/moderators/${moderatorId}`, moderatorId);
}

export function findMembership(projectId: string, streamParams: IStreamParams | null = null) {
  return streams.get<{data: FoundUser[]}>({ apiEndpoint: `${API_PATH}/projects/${projectId}/moderators/users_search`, ...streamParams, cacheStream: false });
}

export function addMembership(projectId: string, user_id: string) {
  return streams.add(`${API_PATH}/projects/${projectId}/moderators`, { moderator: { user_id } });
}
