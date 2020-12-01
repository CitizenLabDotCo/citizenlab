import { API_PATH } from 'containers/App/constants';
import streams from 'utils/streams';
import { IUsers } from 'services/users';

export function moderatorsStream(projectFolderId: string) {
  return streams.get<IUsers>({
    apiEndpoint: `${API_PATH}/users/project_folder_moderators`,
    queryParameters: { folder_id: projectFolderId },
  });
}

export async function deleteModerator(
  projectFolderId: string,
  moderatorId: string
) {
  const response = await streams.delete(
    `${API_PATH}/users/project_folder_moderators/${moderatorId}?folder_id=${projectFolderId}`,
    moderatorId,
    true
  );
  await streams.fetchAllWith({
    apiEndpoint: [`${API_PATH}/users/project_folder_moderators`],
  });
  return response;
}

export async function addModerator(
  projectFolderId: string,
  moderatorId: string
) {
  const response = await streams.add(
    `${API_PATH}/users/project_folder_moderators`,
    {
      project_folder_moderator: {
        folder_id: projectFolderId,
        user_id: moderatorId,
      },
    }
  );
  await streams.fetchAllWith({
    apiEndpoint: [`${API_PATH}/users/project_folder_moderators`],
  });
  return response;
}
