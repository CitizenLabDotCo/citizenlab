import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import invitesKeys from './keys';

export interface QueryParams {
  importId?: string | null;
}

export interface UseInvitesImportOptions {
  pollingEnabled?: boolean;
  enabled?: boolean;
}

const fetchInvitesImport = ({ importId }: QueryParams) =>
  fetcher<any>({
    path: `/invites_imports/${importId}`,
    action: 'get',
  });

const useInvitesImport = (
  queryParams: QueryParams,
  { pollingEnabled, enabled }: UseInvitesImportOptions = {}
) => {
  const queryClient = useQueryClient();
  const isEnabled = enabled !== false && !!queryParams.importId;

  const result = useQuery<any, CLErrors, any, any>({
    queryKey: invitesKeys.lists(),
    queryFn: () => fetchInvitesImport(queryParams),
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

export default useInvitesImport;
