import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import { IProject, ProjectsKeys } from 'api/projects/types';

import fetcher from 'utils/cl-react-query/fetcher';
import queryOptions from 'utils/cl-react-query/queryOptions';

import projectsKeys from './keys';

export const fetchProjectBySlug = ({ slug }: { slug?: string | null }) =>
  fetcher<IProject>({ path: `/projects/by_slug/${slug}`, action: 'get' });

export const projectBySlugOptions = (slug?: string | null) =>
  queryOptions<IProject, ProjectsKeys>({
    queryKey: projectsKeys.item({ slug }),
    queryFn: () => fetchProjectBySlug({ slug }),
  });

const useProjectBySlug = (slug?: string | null) => {
  return useQuery<IProject, CLErrors, IProject, ProjectsKeys>({
    ...projectBySlugOptions(slug),
    enabled: !!slug,
    refetchOnWindowFocus: false,
  });
};

export default useProjectBySlug;
