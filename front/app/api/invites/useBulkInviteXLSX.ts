import { useMutation, useQueryClient } from '@tanstack/react-query';

import fetcher from 'utils/cl-react-query/fetcher';

import invitesKeys from './keys';
import { IInvitesImport, INewBulkXLSXInviteXLSX, IInviteError } from './types';

const bulkInviteXLSX = async (requestBody: INewBulkXLSXInviteXLSX) =>
  fetcher<IInvitesImport>({
    path: `/invites_imports/bulk_create_xlsx`,
    action: 'post',
    body: { invites: requestBody },
  });

const useBulkInviteXLSX = () => {
  const queryClient = useQueryClient();
  return useMutation<IInvitesImport, IInviteError, INewBulkXLSXInviteXLSX>({
    mutationFn: bulkInviteXLSX,
    // This only enqueues the job. The seat numbers change when it finishes, so
    // refreshing them belongs with the polling that watches for that —
    // `useInvitesImport`, not a fixed delay from here.
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: invitesKeys.lists(),
      });
    },
  });
};

export default useBulkInviteXLSX;
