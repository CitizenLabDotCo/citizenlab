import { API_PATH } from 'containers/App/constants';
import streams, { IStreamParams } from 'utils/streams';
import { IUsers } from 'services/users';
import { IGroupMembershipsFoundUserData } from 'services/groupMemberships';
import { queryClient } from 'utils/cl-react-query/queryClient';
import seatsKeys from 'api/seats/keys';

const ivalidateSeatsCache = () => {
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
  ivalidateSeatsCache();
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

export async function addMembership(projectId: string, user_id: string) {
  const response = await streams.add(
    `${API_PATH}/projects/${projectId}/moderators`,
    {
      moderator: { user_id },
    }
  );
  ivalidateSeatsCache();
  return response;
}
