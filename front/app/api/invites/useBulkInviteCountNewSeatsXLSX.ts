import { useMutation, useQueryClient } from '@tanstack/react-query';
import fetcher from 'utils/cl-react-query/fetcher';
import invitesKeys from './keys';
import {
  IInvitesNewSeats,
  INewBulkXLSXInviteXLSX,
  IInviteError,
} from './types';

const bulkInviteCountNewSeatsXLSX = async (
  requestBody: INewBulkXLSXInviteXLSX
) =>
  fetcher<IInvitesNewSeats>({
    path: `/invites/count_new_seats_xlsx`,
    action: 'post',
    body: { invites: requestBody },
  });

const useBulkInviteCountNewSeatsXLSX = () => {
  const queryClient = useQueryClient();
  return useMutation<IInvitesNewSeats, IInviteError, INewBulkXLSXInviteXLSX>({
    mutationFn: bulkInviteCountNewSeatsXLSX,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: invitesKeys.lists(),
      });
    },
  });
};

export default useBulkInviteCountNewSeatsXLSX;
