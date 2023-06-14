import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import projectAllowedInputKeys from './keys';
import {
  IProjectGroupsParams,
  ProjectGroupsKeys,
  IProjectGroups,
} from './types';

const fetchProjectGroups = ({ projectId }: IProjectGroupsParams) =>
  fetcher<IProjectGroups>({
    path: `/projects/${projectId}/groups_projects`,
    action: 'get',
  });

const useProjectGroups = (params: IProjectGroupsParams) => {
  return useQuery<IProjectGroups, CLErrors, IProjectGroups, ProjectGroupsKeys>({
    queryKey: projectAllowedInputKeys.list(params),
    queryFn: () => fetchProjectGroups(params),
  });
};

export default useProjectGroups;
