import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import miniProjectsKeys from './keys';
import { ProjectsMiniAdmin, ProjectsMiniAdminKeys, Parameters } from './types';

const fetchProjectsMiniAdmin = (queryParameters: Parameters) =>
  fetcher<ProjectsMiniAdmin>({
    path: `/projects/for_admin`,
    action: 'get',
    queryParams: {
      ...queryParameters,
      'page[size]': queryParameters['page[size]'] ?? 6,
      'page[number]': queryParameters['page[number]'] ?? 1,
    },
  });

const useProjectsMiniAdmin = (
  queryParams: Parameters,
  { enabled = true }: { enabled: boolean } = { enabled: true }
) => {
  return useQuery<
    ProjectsMiniAdmin,
    CLErrors,
    ProjectsMiniAdmin,
    ProjectsMiniAdminKeys
  >({
    queryKey: miniProjectsKeys.list(queryParams),
    queryFn: () => {
      return fetchProjectsMiniAdmin(queryParams);
    },
    enabled,
  });
};

export default useProjectsMiniAdmin;
