import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import adminPublicationsStatusCountsKeys from './keys';
import { IStatusCounts, AdminPublicationsStatusCountsKeys } from './types';
import { IQueryParameters } from 'api/admin_publications/types';

const fetchStatusCounts = ({
  rootLevelOnly,
  removeNotAllowedParents,
  publicationStatusFilter,
  childrenOfId,
  topicIds,
  areaIds,
  onlyProjects,
  ...queryParameters
}: IQueryParameters) =>
  fetcher<IStatusCounts>({
    path: `/admin_publications/status_counts`,
    action: 'get',
    queryParams: {
      ...queryParameters,
      'page[size]': undefined,
      'page[number]': undefined,
      depth: rootLevelOnly ? 0 : undefined,
      remove_not_allowed_parents: removeNotAllowedParents,
      publication_statuses: publicationStatusFilter,
      folder: childrenOfId,
      topics: topicIds,
      areas: areaIds,
      only_projects: onlyProjects,
    },
  });

const useAdminPublicationsStatusCounts = (queryParams: IQueryParameters) => {
  return useQuery<
    IStatusCounts,
    CLErrors,
    IStatusCounts,
    AdminPublicationsStatusCountsKeys
  >({
    queryKey: adminPublicationsStatusCountsKeys.item(queryParams),
    queryFn: () => fetchStatusCounts(queryParams),
  });
};

export default useAdminPublicationsStatusCounts;
