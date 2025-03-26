import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import { IProject, ProjectsKeys } from 'api/projects/types';

import fetcher from 'utils/cl-react-query/fetcher';

import communityMonitorKeys from './keys';

const fetchCommunityMonitorProject = () => {
  return fetcher<IProject>({
    path: '/projects/community_monitor',
    action: 'get',
  });
};

type UseCommunityMonitorProjectOptions = {
  enabled?: boolean;
};

const useCommunityMonitorProject = ({
  enabled,
}: UseCommunityMonitorProjectOptions) => {
  return useQuery<IProject, CLErrors, IProject, ProjectsKeys>({
    queryKey: communityMonitorKeys.all(),
    queryFn: fetchCommunityMonitorProject,
    enabled,
  });
};

export default useCommunityMonitorProject;
