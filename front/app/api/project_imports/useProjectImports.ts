import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import projectImportKeys, { QueryParams } from './keys';

const fetchProjectImports = ({ importId }: QueryParams) =>
  fetcher<any>({
    path: `/importer/project_imports/${importId}`,
    action: 'get',
  });

// TODO: SORT OUT THE TYPES
const useProjectImports = (
  queryParams: QueryParams,
  { pollingEnabled }: { pollingEnabled?: boolean } = {}
) => {
  return useQuery<any, CLErrors, any, any>({
    queryKey: projectImportKeys.list(queryParams),
    queryFn: () => fetchProjectImports(queryParams),
    refetchInterval: pollingEnabled ? 5000 : false,
  });
};

export default useProjectImports;
