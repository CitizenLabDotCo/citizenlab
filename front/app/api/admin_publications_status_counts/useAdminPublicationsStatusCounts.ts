import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import { IQueryParameters } from 'api/admin_publications/types';

import fetcher from 'utils/cl-react-query/fetcher';

import adminPublicationsStatusCountsKeys from './keys';
import { IStatusCounts, AdminPublicationsStatusCountsKeys } from './types';

export const fetchStatusCounts = ({
  rootLevelOnly,
  removeNotAllowedParents,
  publicationStatusFilter,
  childrenOfId,
  globalTopicIds: topicIds,
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

const useAdminPublicationsStatusCounts = (
  queryParams: IQueryParameters,
  { enabled = true } = {}
) => {
  return useQuery<
    IStatusCounts,
    CLErrors,
    IStatusCounts,
    AdminPublicationsStatusCountsKeys
  >({
    queryKey: adminPublicationsStatusCountsKeys.item(queryParams),
    queryFn: () => fetchStatusCounts(queryParams),
    enabled,
  });
};

export default useAdminPublicationsStatusCounts;
