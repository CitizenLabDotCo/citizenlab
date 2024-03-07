import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import ideasByProjectKeys from './keys';
import {
  IIdeasByProject,
  IdeasByProjectKeys,
  IIdeasByProjectParams,
} from './types';

const fetchIdeasByProject = (params: IIdeasByProjectParams) =>
  fetcher<IIdeasByProject>({
    path: `/stats/ideas_by_project`,
    action: 'get',
    queryParams: params,
  });

const useIdeasByProject = ({
  enabled,
  ...queryParameters
}: IIdeasByProjectParams & { enabled: boolean }) => {
  return useQuery<
    IIdeasByProject,
    CLErrors,
    IIdeasByProject,
    IdeasByProjectKeys
  >({
    queryKey: ideasByProjectKeys.item(queryParameters),
    queryFn: () => fetchIdeasByProject(queryParameters),
    enabled,
  });
};

export default useIdeasByProject;
