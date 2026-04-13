import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import { IUsers } from 'api/users/types';

import fetcher from 'utils/cl-react-query/fetcher';

import projectModeratorsKeys from './keys';
import { ProjectModeratorsKeys, ProjectModeratorParams } from './types';

const fetchProjectModerators = ({ projectId }: ProjectModeratorParams) => {
  return fetcher<IUsers>({
    path: `/projects/${projectId}/moderators`,
    action: 'get',
  });
};

const useProjectModerators = ({ projectId }: ProjectModeratorParams) => {
  return useQuery<IUsers, CLErrors, IUsers, ProjectModeratorsKeys>({
    queryKey: projectModeratorsKeys.list({ projectId }),
    queryFn: () => fetchProjectModerators({ projectId }),
    enabled: !!projectId,
  });
};

export default useProjectModerators;
