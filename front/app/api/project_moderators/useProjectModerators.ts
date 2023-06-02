import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import projectModeratorsKeys from './keys';
import { ProjectModeratorsKeys, ProjectForderParams } from './types';
import { IUsers } from 'api/users/types';

const fetchProjectModerators = ({ projectId }: ProjectForderParams) => {
  return fetcher<IUsers>({
    path: `/projects/${projectId}/moderators`,
    action: 'get',
  });
};

const useProjectModerators = ({ projectId }: ProjectForderParams) => {
  return useQuery<IUsers, CLErrors, IUsers, ProjectModeratorsKeys>({
    queryKey: projectModeratorsKeys.list({ projectId }),
    queryFn: () => fetchProjectModerators({ projectId }),
  });
};

export default useProjectModerators;
