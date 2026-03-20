import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import { TSeatType } from 'components/admin/SeatBasedBilling/SeatInfo';

import fetcher from 'utils/cl-react-query/fetcher';

import usersKeys from './keys';
import { UsersKeys } from './types';

type QueryParams = {
  user_id?: string;
  user_email?: string;
  seat_type: TSeatType;
};

type Response = {
  data: {
    type: 'check_if_exceeds_seats';
    attributes: {
      value: boolean;
    };
  };
};

const fetchCheckIfExceedsSeats = (queryParams: QueryParams) =>
  fetcher<Response>({
    path: '/users/check_if_exceeds_seats',
    action: 'get',
    queryParams,
  });

const useBilledSeats = (queryParams: QueryParams) => {
  return useQuery<Response, CLErrors, Response, UsersKeys>({
    queryKey: usersKeys.list(queryParams),
    queryFn: () => fetchCheckIfExceedsSeats(queryParams),
  });
};

export default useBilledSeats;
