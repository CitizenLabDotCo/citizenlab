import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import { IInvitesImport, InvitesImportKeys } from 'api/invites/types';

import fetcher from 'utils/cl-react-query/fetcher';

import invitesImportKeys from './invitesImportKeys';
import invitesKeys from './keys';

export interface QueryParams {
  importId: string | null;
  enabled?: boolean;
}

const fetchInvitesImport = ({ importId }: QueryParams) =>
  fetcher<IInvitesImport>({
    path: `/invites_imports/${importId}`,
    action: 'get',
  });

const useInvitesImport = (queryParams: QueryParams) => {
  const queryClient = useQueryClient();
  const result = useQuery<
    IInvitesImport | null,
    CLErrors,
    IInvitesImport,
    InvitesImportKeys
  >({
    queryKey: invitesImportKeys.item({ id: queryParams.importId }),
    queryFn: () => fetchInvitesImport(queryParams),
    refetchInterval: 5000, // Should always poll when enabled
    enabled: queryParams.enabled,
  });

  // Reset the invite data as well, preventing stale data when revisiting the component
  const resetQueryData = () => {
    queryClient.resetQueries({ queryKey: invitesImportKeys.all() });
    queryClient.resetQueries({ queryKey: invitesKeys.lists() });
  };

  return {
    ...result,
    resetQueryData,
  };
};

export default useInvitesImport;
