import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import invitesKeys from './keys';

export interface QueryParams {
  importId?: string | null;
}

export interface UseInviteImportOptions {
  pollingEnabled?: boolean;
  enabled?: boolean;
}

// TODO: SORT OUT THE TYPES
const fetchInviteImports = ({ importId }: QueryParams) =>
  fetcher<any>({
    path: `/invites_imports/${importId}`,
    action: 'get',
  });

const useInviteImports = (
  queryParams: QueryParams,
  { pollingEnabled, enabled }: UseInviteImportOptions = {}
) => {
  const queryClient = useQueryClient();
  const isEnabled = enabled !== false && !!queryParams.importId;

  const result = useQuery<any, CLErrors, any, any>({
    queryKey: invitesKeys.lists(),
    queryFn: () => fetchInviteImports(queryParams),
    refetchInterval: pollingEnabled ? 5000 : false,
    enabled: isEnabled,
  });

  // Reset the query data, preventing stale data when revisiting the component
  const resetQueryData = () => {
    queryClient.resetQueries({ queryKey: invitesKeys.lists() });
  };

  return {
    ...result,
    resetQueryData,
  };
};

export default useInviteImports;
