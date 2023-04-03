import { API_PATH } from 'containers/App/constants';
import streams from 'utils/streams';
import { IUsers } from 'services/users';
import { queryClient } from 'utils/cl-react-query/queryClient';
import seatsKeys from 'api/seats/keys';

const indexPath = (projectFolderId: string) =>
  `${API_PATH}/project_folders/${projectFolderId}/moderators`;

const showPath = (projectFolderId: string, moderatorId: string) =>
  `${indexPath(projectFolderId)}/${moderatorId}`;

const invalidateSeatsCache = () => {
  queryClient.invalidateQueries({ queryKey: seatsKeys.items() });
};

export function folderModeratorsStream(projectFolderId: string) {
  return streams.get<IUsers>({
    apiEndpoint: indexPath(projectFolderId),
    queryParameters: { project_folder_id: projectFolderId },
  });
}

export async function deleteFolderModerator(
  projectFolderId: string,
  moderatorId: string
) {
  const response = await streams.delete(
    showPath(projectFolderId, moderatorId),
    moderatorId,
    true
  );

  invalidateSeatsCache();

  await streams.fetchAllWith({
    apiEndpoint: [indexPath(projectFolderId)],
  });
  return response;
}

export async function addFolderModerator(
  projectFolderId: string,
  moderatorId: string
) {
  const response = await streams.add(indexPath(projectFolderId), {
    project_folder_moderator: {
      user_id: moderatorId,
    },
  });

  invalidateSeatsCache();
  await streams.fetchAllWith({
    apiEndpoint: [`${API_PATH}/users`],
  });

  return response;
}
