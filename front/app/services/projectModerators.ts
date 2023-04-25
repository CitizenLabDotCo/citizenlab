import { API_PATH } from 'containers/App/constants';
import streams from 'utils/streams';
import { IUsers } from 'services/users';
import { queryClient } from 'utils/cl-react-query/queryClient';
import seatsKeys from 'api/seats/keys';

const invalidateSeatsCache = () => {
  queryClient.invalidateQueries({ queryKey: seatsKeys.items() });
};

export function projectModeratorsStream(projectId: string) {
  return streams.get<IUsers>({
    apiEndpoint: `${API_PATH}/projects/${projectId}/moderators`,
  });
}

export async function deleteProjectModerator(
  projectId: string,
  moderatorId: string
) {
  const response = await streams.delete(
    `${API_PATH}/projects/${projectId}/moderators/${moderatorId}`,
    moderatorId
  );
  invalidateSeatsCache();
  await streams.fetchAllWith({
    apiEndpoint: [
      `${API_PATH}/projects/${projectId}/moderators`,
      `${API_PATH}/users`,
    ],
  });
  return response;
}

export async function addProjectModerator(projectId: string, user_id: string) {
  const response = await streams.add(
    `${API_PATH}/projects/${projectId}/moderators`,
    {
      moderator: { user_id },
    }
  );
  invalidateSeatsCache();
  await streams.fetchAllWith({
    apiEndpoint: [`${API_PATH}/users`, `${API_PATH}/stats/users_count`],
  });

  return response;
}
