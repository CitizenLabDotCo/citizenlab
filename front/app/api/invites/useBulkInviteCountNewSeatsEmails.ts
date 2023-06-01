import { useMutation, useQueryClient } from '@tanstack/react-query';
import fetcher from 'utils/cl-react-query/fetcher';
import invitesKeys from './keys';
import { IInvitesNewSeats, INewBulkInviteEmails, IInviteError } from './types';
import invalidateSeatsCache from 'api/seats/invalidateSeatsCache';

const bulkInviteCountNewSeatsEmails = async (
  requestBody: INewBulkInviteEmails
) =>
  fetcher<IInvitesNewSeats>({
    path: `/invites/count_new_seats`,
    action: 'post',
    body: { invites: requestBody },
  });

const useBulkInviteCountNewSeatsEmails = () => {
  const queryClient = useQueryClient();
  return useMutation<IInvitesNewSeats, IInviteError, INewBulkInviteEmails>({
    mutationFn: bulkInviteCountNewSeatsEmails,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: invitesKeys.lists(),
      });
      invalidateSeatsCache();
    },
  });
};

export default useBulkInviteCountNewSeatsEmails;
