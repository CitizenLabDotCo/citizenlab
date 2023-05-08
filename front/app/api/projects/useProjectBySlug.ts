import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import projectsKeys from './keys';
import { IProject, ProjectsKeys } from 'api/projects/types';

const fetchProjectBySlug = ({ slug }: { slug?: string | null }) =>
  fetcher<IProject>({ path: `/projects/by_slug/${slug}`, action: 'get' });

const useProjectBySlug = (slug?: string | null) => {
  return useQuery<IProject, CLErrors, IProject, ProjectsKeys>({
    queryKey: projectsKeys.item({ slug }),
    queryFn: () => fetchProjectBySlug({ slug }),
    enabled: !!slug,
  });
};

export default useProjectBySlug;
