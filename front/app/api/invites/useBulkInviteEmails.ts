import { useMutation, useQueryClient } from '@tanstack/react-query';

import fetcher from 'utils/cl-react-query/fetcher';

import invitesKeys from './keys';
import { IInvitesImport, INewBulkInviteEmails, IInviteError } from './types';

const bulkInviteEmails = async (requestBody: INewBulkInviteEmails) =>
  fetcher<IInvitesImport>({
    path: `/invites_imports/bulk_create`,
    action: 'post',
    body: { invites: requestBody },
  });

const useBulkInviteEmails = () => {
  const queryClient = useQueryClient();
  return useMutation<IInvitesImport, IInviteError, INewBulkInviteEmails>({
    mutationFn: bulkInviteEmails,
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

export default useBulkInviteEmails;
