import { useCallback } from 'react';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import appConfigurationKeys from 'api/app_configuration/keys';
import { IInvitesImport, InvitesImportKeys } from 'api/invites/types';
import seatsKeys from 'api/seats/keys';

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

const POLL_INTERVAL_MS = 5000;

// Both job types have an `_xlsx` variant, so match on the prefix.
const isCompletedInviteCreation = (data: IInvitesImport | undefined) => {
  const attributes = data?.data.attributes;

  return (
    !!attributes?.completed_at &&
    attributes.job_type.includes('bulk_create') &&
    !(attributes.result?.errors?.length > 0)
  );
};

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
    enabled: queryParams.enabled,
    // Stop polling once the job reports back; the consumer also clears the
    // import id, but that lands a render later.
    refetchInterval: (data) =>
      data?.data.attributes.completed_at ? false : POLL_INTERVAL_MS,
    // A finished creation changes the seat counts, so refresh what displays
    // them. Gated: this runs on every successful poll, including the pending
    // ones, and a failed creation adds no seats.
    onSuccess: (data) => {
      if (!isCompletedInviteCreation(data)) return;

      queryClient.invalidateQueries({ queryKey: seatsKeys.items() });
      queryClient.invalidateQueries({ queryKey: appConfigurationKeys.all() });
    },
  });

  // Reset the invite data as well, preventing stale data when revisiting the component
  // Memoized so callers can depend on it without re-running effects every render
  const resetQueryData = useCallback(() => {
    queryClient.resetQueries({ queryKey: invitesImportKeys.all() });
    queryClient.resetQueries({ queryKey: invitesKeys.lists() });
  }, [queryClient]);

  return {
    ...result,
    resetQueryData,
  };
};

export default useInvitesImport;
