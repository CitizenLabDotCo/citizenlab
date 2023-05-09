import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import projectFoldersKeys from 'api/project_folders/keys';
import { IProjectFolder, IUpdatedProjectFolder } from './types';
import streams from 'utils/streams';
import { API_PATH } from 'containers/App/constants';

export const updateProjectFolder = async ({
  projectFolderId,
  ...requestBody
}: IUpdatedProjectFolder) =>
  fetcher<IProjectFolder>({
    path: `/project_folders/${projectFolderId}`,
    action: 'patch',
    body: { project_folder: { ...requestBody } },
  });

const useUpdateProjectFolder = () => {
  const queryClient = useQueryClient();
  return useMutation<IProjectFolder, CLErrors, IUpdatedProjectFolder>({
    mutationFn: updateProjectFolder,
    onSuccess: async (_data) => {
      queryClient.invalidateQueries({
        queryKey: projectFoldersKeys.item({ id: _data.data.id }),
      });
      queryClient.invalidateQueries({
        queryKey: projectFolderKeys.lists(),
      });
      await streams.fetchAllWith({
        partialApiEndpoint: [`${API_PATH}/admin_publications`],
      });
    },
  });
};

export default useUpdateProjectFolder;
