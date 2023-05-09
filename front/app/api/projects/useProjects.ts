import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import { Props, QueryParameters, IProjects, ProjectsKeys } from './types';
import projectsKeys from './keys';

const fetchProjects = (queryParams: QueryParameters) =>
  fetcher<IProjects>({
    path: `/projects`,
    action: 'get',
    queryParams,
  });

const useProjects = ({
  pageNumber,
  pageSize,
  sort,
  areas,
  publicationStatuses,
  canModerate,
  projectIds,
}: Props) => {
  const queryParameters: QueryParameters = {
    'page[number]': pageNumber ?? 1,
    'page[size]': pageSize ?? 250,
    sort,
    areas,
    publication_statuses: publicationStatuses,
    filter_can_moderate: canModerate,
    filter_ids: projectIds,
  };

  return useQuery<IProjects, CLErrors, IProjects, ProjectsKeys>({
    queryKey: projectsKeys.list(queryParameters),
    queryFn: () => fetchProjects(queryParameters),
  });
};

export default useProjects;
