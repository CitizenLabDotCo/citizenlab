import { API_PATH } from 'containers/App/constants';
import streams from 'utils/streams';
import invalidateSeatsCache from 'api/seats/invalidateSeatsCache';

const indexPath = (projectFolderId: string) =>
  `${API_PATH}/project_folders/${projectFolderId}/moderators`;

const showPath = (projectFolderId: string, moderatorId: string) =>
  `${indexPath(projectFolderId)}/${moderatorId}`;

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
    apiEndpoint: [indexPath(projectFolderId), `${API_PATH}/users`],
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
    apiEndpoint: [`${API_PATH}/users`, `${API_PATH}/stats/users_count`],
  });

  return response;
}
