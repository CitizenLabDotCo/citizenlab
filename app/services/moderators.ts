import { API_PATH } from 'containers/App/constants';
import streams from 'utils/streams';
import { IUsers } from 'services/users';

export function moderatorsStream(projectId: string) {
  return streams.get<IUsers>({ apiEndpoint: `${API_PATH}/projects/${projectId}/moderators` });
}

export async function deleteModerator(projectId: string, moderatorId: string) {
  return streams.delete(`${API_PATH}/projects/${projectId}/moderators`, moderatorId);
}
