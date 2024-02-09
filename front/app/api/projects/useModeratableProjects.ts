import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import { IProjects, ProjectsKeys } from './types';
import projectsKeys from './keys';

type QueryParams = {
  'page[number]': number;
  'page[size]': number;
};

const fetchModeratableProjects = (queryParams: QueryParams) =>
  fetcher<IProjects>({
    path: '/projects/moderatable',
    action: 'get',
    queryParams,
  });

const useModeratableProjects = (
  { enabled = true }: { enabled?: boolean } = { enabled: true }
) => {
  const queryParameters: QueryParams = {
    'page[number]': 1,
    'page[size]': 250,
  };

  return useQuery<IProjects, CLErrors, IProjects, ProjectsKeys>({
    queryKey: projectsKeys.list({
      ...queryParameters,
      publication_statuses: ['published', 'archived', 'draft'],
    }),
    queryFn: () => fetchModeratableProjects(queryParameters),
    enabled,
  });
};

export default useModeratableProjects;
