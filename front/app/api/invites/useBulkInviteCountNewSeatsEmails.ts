import { useMutation, useQueryClient } from '@tanstack/react-query';

import fetcher from 'utils/cl-react-query/fetcher';

import invitesKeys from './keys';
import { IInvitesImport, INewBulkInviteEmails, IInviteError } from './types';

const bulkInviteCountNewSeatsEmails = async (
  requestBody: INewBulkInviteEmails
) =>
  fetcher<IInvitesImport>({
    path: `/invites/count_new_seats`,
    action: 'post',
    body: { invites: requestBody },
  });

const useBulkInviteCountNewSeatsEmails = () => {
  const queryClient = useQueryClient();
  return useMutation<IInvitesImport, IInviteError, INewBulkInviteEmails>({
    mutationFn: bulkInviteCountNewSeatsEmails,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: invitesKeys.lists(),
      });
    },
  });
};

export default useBulkInviteCountNewSeatsEmails;
