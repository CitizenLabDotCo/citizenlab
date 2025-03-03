import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import projectsKeys from 'api/projects/keys';
import { IProject, ProjectsKeys } from 'api/projects/types';

import fetcher from 'utils/cl-react-query/fetcher';

const fetchCommunityMonitorProject = () => {
  return fetcher<IProject>({
    path: '/projects/community_monitor',
    action: 'get',
  });
};

const useCommunityMonitorProject = (id?: string) => {
  return useQuery<IProject, CLErrors, IProject, ProjectsKeys>({
    queryKey: projectsKeys.item({ id }),
    queryFn: () => fetchCommunityMonitorProject(),
  });
};

export default useCommunityMonitorProject;
