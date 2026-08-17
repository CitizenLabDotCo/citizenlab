import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import { IProject, ProjectsKeys } from 'api/projects/types';

import fetcher from 'utils/cl-react-query/fetcher';
import queryOptions from 'utils/cl-react-query/queryOptions';

import projectsKeys from './keys';

export const fetchProjectById = ({
  id,
  useCache = true,
}: {
  id?: string | null;
  useCache?: boolean;
}) =>
  fetcher<IProject>({
    path: `/projects/${id}`,
    action: 'get',
    queryParams: {
      use_cache: useCache,
    },
  });

export const projectByIdOptions = (
  id?: string | null,
  useCache: boolean = true
) =>
  queryOptions<IProject, ProjectsKeys>({
    queryKey: projectsKeys.item({ id }),
    queryFn: () => fetchProjectById({ id, useCache }),
  });

const useProjectById = (id?: string | null, useCache: boolean = true) => {
  return useQuery<IProject, CLErrors, IProject, ProjectsKeys>({
    ...projectByIdOptions(id, useCache),
    enabled: !!id,
  });
};

export default useProjectById;
