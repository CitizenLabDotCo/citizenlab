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
    // This only enqueues the job. Seat numbers change when it finishes, so
    // `useInvitesImport` refreshes them on completion.
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: invitesKeys.lists(),
      });
    },
  });
};

export default useBulkInviteEmails;
