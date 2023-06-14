import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import projectFoldersKeys from './keys';
import { IProjectFolder, ProjectFoldersKeys } from './types';

const fetchProjectFolderById = ({ id }: { id?: string }) =>
  fetcher<IProjectFolder>({
    path: `/project_folders/${id}`,
    action: 'get',
  });

const useProjectFolderById = (projectFolderId?: string) => {
  return useQuery<IProjectFolder, CLErrors, IProjectFolder, ProjectFoldersKeys>(
    {
      queryKey: projectFoldersKeys.item({ id: projectFolderId }),
      queryFn: () => fetchProjectFolderById({ id: projectFolderId }),
      enabled: !!projectFolderId,
    }
  );
};

export default useProjectFolderById;
