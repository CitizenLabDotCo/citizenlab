import { API_PATH } from 'containers/App/constants';
import streams from 'utils/streams';
import { IUsers } from 'services/users';

export function moderatorsStream(projectId) {
  return streams.get<IUsers>({ apiEndpoint: `${API_PATH}/projects/${projectId}/moderators` });
}
