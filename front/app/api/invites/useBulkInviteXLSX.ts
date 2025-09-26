import { useMutation, useQueryClient } from '@tanstack/react-query';

import invalidateSeatsCache from 'api/seats/invalidateSeatsCache';

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
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: invitesKeys.lists(),
      });
      invalidateSeatsCache();
    },
  });
};

export default useBulkInviteXLSX;
