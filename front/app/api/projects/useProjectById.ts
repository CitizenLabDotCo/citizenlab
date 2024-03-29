import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import { IProject, ProjectsKeys } from 'api/projects/types';

import fetcher from 'utils/cl-react-query/fetcher';

import projectsKeys from './keys';

export const fetchProjectById = ({ id }: { id?: string | null }) =>
  fetcher<IProject>({ path: `/projects/${id}`, action: 'get' });

const useProjectById = (id?: string | null) => {
  return useQuery<IProject, CLErrors, IProject, ProjectsKeys>({
    queryKey: projectsKeys.item({ id }),
    queryFn: () => fetchProjectById({ id }),
    enabled: !!id,
  });
};

export default useProjectById;
