import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import invitesKeys from './keys';
import { IInvites, IQueryParameters, InvitesKeys } from './types';

export const defaultPageSize = 20;

const fetchInvites = ({
  pageNumber,
  pageSize,
  ...queryParams
}: IQueryParameters) =>
  fetcher<IInvites>({
    path: `/invites`,
    action: 'get',
    queryParams: {
      'page[number]': pageNumber || 1,
      'page[size]': pageSize || defaultPageSize,
      ...queryParams,
    },
  });

const useInvites = (queryParams: IQueryParameters) => {
  return useQuery<IInvites, CLErrors, IInvites, InvitesKeys>({
    queryKey: invitesKeys.list(queryParams),
    queryFn: () => fetchInvites(queryParams),
  });
};

export default useInvites;
