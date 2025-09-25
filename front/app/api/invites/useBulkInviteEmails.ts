import { useMutation, useQueryClient } from '@tanstack/react-query';

import invalidateSeatsCache from 'api/seats/invalidateSeatsCache';

import fetcher from 'utils/cl-react-query/fetcher';

import invitesKeys from './keys';
import { IInvites, INewBulkInviteEmails, IInviteError } from './types';

const bulkInviteEmails = async (requestBody: INewBulkInviteEmails) =>
  fetcher<IInvites>({
    path: `/invites_imports/bulk_create`,
    action: 'post',
    body: { invites: requestBody },
  });

const useBulkInviteEmails = () => {
  const queryClient = useQueryClient();
  return useMutation<IInvites, IInviteError, INewBulkInviteEmails>({
    mutationFn: bulkInviteEmails,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: invitesKeys.lists(),
      });
      invalidateSeatsCache();
    },
  });
};

export default useBulkInviteEmails;
