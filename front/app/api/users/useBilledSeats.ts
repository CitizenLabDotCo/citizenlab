import { useInfiniteQuery } from '@tanstack/react-query';
import { CLErrors, Pagination } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';
import { getPageNumberFromUrl } from 'utils/paginationUtils';

import usersKeys from './keys';
import { IUsers } from './types';

const DEFAULT_PAGE_SIZE = 8;

interface Params {
  seatType: 'admin' | 'moderator';
}

const fetchBilledSeats = ({ seatType }: Params, pagination: Pagination) =>
  fetcher<IUsers>({
    path: `/users/billed_${seatType}s`,
    action: 'get',
    queryParams: pagination,
  });

const useBilledSeats = (params: Params) => {
  return useInfiniteQuery<IUsers, CLErrors>(
    usersKeys.list(params),
    ({ pageParam = 1 }) =>
      fetchBilledSeats(params, {
        'page[number]': pageParam,
        'page[size]': DEFAULT_PAGE_SIZE,
      }),
    {
      getNextPageParam: (lastPage) => {
        const nextLink = lastPage.links.next;
        return nextLink ? getPageNumberFromUrl(nextLink) : undefined;
      },
    }
  );
};

export default useBilledSeats;
