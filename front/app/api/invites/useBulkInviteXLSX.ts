import { useMutation, useQueryClient } from '@tanstack/react-query';

import fetcher from 'utils/cl-react-query/fetcher';

import invalidateSeatsCache from 'api/seats/invalidateSeatsCache';

import invitesKeys from './keys';
import { IInvites, INewBulkXLSXInviteXLSX, IInviteError } from './types';

const bulkInviteXLSX = async (requestBody: INewBulkXLSXInviteXLSX) =>
  fetcher<IInvites>({
    path: `/invites/bulk_create_xlsx`,
    action: 'post',
    body: { invites: requestBody },
  });

const useBulkInviteXLSX = () => {
  const queryClient = useQueryClient();
  return useMutation<IInvites, IInviteError, INewBulkXLSXInviteXLSX>({
    mutationFn: bulkInviteXLSX,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: invitesKeys.lists(),
      });
      invalidateSeatsCache();
    },
  });
};

export default useBulkInviteXLSX;
