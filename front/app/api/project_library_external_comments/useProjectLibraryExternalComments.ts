import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import projectLibraryProjectsKeys from './keys';
import {
  GetParams,
  ExternalComments,
  ProjectLibraryExternalCommentsKeys,
} from './types';

export const fetchLibraryExternalComments = ({
  projectId,
  ...params
}: GetParams) =>
  fetcher<ExternalComments>({
    path: `/projects/${projectId}/external_comments`,
    action: 'get',
    queryParams: {
      'page[size]': params['page[size]'] ?? 10,
      'page[number]': params['page[number]'] ?? 1,
    },
    apiPath: '/project_library_api',
  });

const useProjectLibraryExternalComments = (
  params: GetParams,
  { enabled = true } = {}
) => {
  return useQuery<
    ExternalComments,
    CLErrors,
    ExternalComments,
    ProjectLibraryExternalCommentsKeys
  >({
    queryKey: projectLibraryProjectsKeys.list(params),
    queryFn: () => fetchLibraryExternalComments(params),
    enabled,
  });
};

export default useProjectLibraryExternalComments;
