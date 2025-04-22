import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import projectsKeys from './keys';
import { Props, QueryParameters, IProjects, ProjectsKeys } from './types';

const fetchProjects = (queryParams: QueryParameters) =>
  fetcher<IProjects>({
    path: '/projects',
    action: 'get',
    queryParams,
  });

const useProjects = (
  {
    pageNumber,
    pageSize,
    sort,
    areas,
    publicationStatuses,
    canModerate,
    projectIds,
    includeHidden,
  }: Props,
  { enabled = true }: { enabled?: boolean } = { enabled: true }
) => {
  const queryParameters: QueryParameters = {
    'page[number]': pageNumber ?? 1,
    'page[size]': pageSize ?? 250,
    sort,
    areas,
    publication_statuses: publicationStatuses,
    filter_can_moderate: canModerate,
    filter_ids: projectIds,
    include_hidden: includeHidden,
  };

  return useQuery<IProjects, CLErrors, IProjects, ProjectsKeys>({
    queryKey: projectsKeys.list(queryParameters),
    queryFn: () => fetchProjects(queryParameters),
    enabled,
  });
};

export default useProjects;
