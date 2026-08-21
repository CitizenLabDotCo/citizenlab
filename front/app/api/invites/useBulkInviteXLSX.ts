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
    // This only enqueues the job. Seat numbers change when it finishes, so
    // `useInvitesImport` refreshes them on completion.
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: invitesKeys.lists(),
      });
    },
  });
};

export default useBulkInviteXLSX;
