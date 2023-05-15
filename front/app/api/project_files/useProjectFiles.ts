import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import projectFilesKeys from './keys';
import { IProjectFiles, ProjectFilesKeys } from './types';

const fetchProjectFiles = ({ projectId }: { projectId: string | null }) =>
  fetcher<IProjectFiles>({
    path: `/projects/${projectId}/files`,
    action: 'get',
  });

const useProjectFiles = (projectId: string | null) => {
  return useQuery<IProjectFiles, CLErrors, IProjectFiles, ProjectFilesKeys>({
    queryKey: projectFilesKeys.list({ projectId }),
    queryFn: () => fetchProjectFiles({ projectId }),
    enabled: !!projectId,
  });
};

export default useProjectFiles;
