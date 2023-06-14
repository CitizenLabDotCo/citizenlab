import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import projectFoldersKeys from './keys';
import { IProjectFolder, ProjectFoldersKeys } from './types';

const fetchProjectFolderBySlug = ({ slug }: { slug?: string }) =>
  fetcher<IProjectFolder>({
    path: `/project_folders/by_slug/${slug}`,
    action: 'get',
  });

const useProjectFolderBySlug = (projectFolderSlug?: string) => {
  return useQuery<IProjectFolder, CLErrors, IProjectFolder, ProjectFoldersKeys>(
    {
      queryKey: projectFoldersKeys.item({ slug: projectFolderSlug }),
      queryFn: () => fetchProjectFolderBySlug({ slug: projectFolderSlug }),
      enabled: !!projectFolderSlug,
    }
  );
};

export default useProjectFolderBySlug;
