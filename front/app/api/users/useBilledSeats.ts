import { useQuery } from '@tanstack/react-query';
import { Pagination, CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import usersKeys from './keys';
import { IUsers, UsersKeys } from './types';

const DEFAULT_PAGE_SIZE = 8;

interface Params extends Pagination {
  seatType: 'admin' | 'moderator';
}

const fetchBilledSeats = ({ seatType, ...pagination }) =>
  fetcher<IUsers>({
    path: `/users/billed_${seatType}s`,
    action: 'get',
    queryParams: {
      'page[number]': pagination['page[number]'] ?? 1,
      'page[size]': pagination['page[size]'] ?? DEFAULT_PAGE_SIZE,
    },
  });

const useBilledSeats = (params: Params) => {
  return useQuery<IUsers, CLErrors, IUsers, UsersKeys>({
    queryKey: usersKeys.list(params),
    queryFn: () => fetchBilledSeats(params),
  });
};

export default useBilledSeats;
