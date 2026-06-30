import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import customPagesKeys from './keys';
import { ICustomPages, CustomPagesKeys } from './types';

export const fetchCustomPages = (projectId?: string) => {
  return fetcher<ICustomPages>({
    path: '/static_pages',
    action: 'get',
    queryParams: projectId ? { project_id: projectId } : undefined,
  });
};

// Without `projectId`, returns the global (non-project) pages
// With `projectId`, returns the pages scoped to the project
const useCustomPages = ({ projectId }: { projectId?: string } = {}) => {
  return useQuery<ICustomPages, CLErrors, ICustomPages, CustomPagesKeys>({
    queryKey: customPagesKeys.lists({ projectId }),
    queryFn: () => fetchCustomPages(projectId),
  });
};

export default useCustomPages;
