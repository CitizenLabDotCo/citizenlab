import { API_PATH } from 'containers/App/constants';
import streams from 'utils/streams';
import { IUsers } from 'services/users';

const indexPath = (projectFolderId: string) =>
  `${API_PATH}/project_folders/${projectFolderId}/moderators`;

const showPath = (projectFolderId: string, moderatorId: string) =>
  `${indexPath(projectFolderId)}/${moderatorId}`;

export function folderModeratorsStream(
  projectFolderId: string,
  cacheStream?: boolean
) {
  return streams.get<IUsers>({
    cacheStream,
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
  await streams.fetchAllWith({
    apiEndpoint: [indexPath(projectFolderId)],
  });
  return response;
}
