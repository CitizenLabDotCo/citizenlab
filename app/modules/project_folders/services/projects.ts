import { IProject } from 'services/projects';

import streams from 'utils/streams';
import { API_PATH } from 'containers/App/constants';

const apiEndpoint = `${API_PATH}/projects`;

export async function updateProjectFolderMembership(
  projectId: string,
  newProjectFolderId: string | null,
  oldProjectFolderId?: string
) {
  const response = await streams.update<IProject>(
    `${apiEndpoint}/${projectId}`,
    projectId,
    { project: { folder_id: newProjectFolderId } }
  );

  await streams.fetchAllWith({
    dataId: [newProjectFolderId, oldProjectFolderId].filter(
      (item) => item
    ) as string[],
    apiEndpoint: [`${API_PATH}/admin_publications`, `${API_PATH}/projects`],
  });

  return response;
}
