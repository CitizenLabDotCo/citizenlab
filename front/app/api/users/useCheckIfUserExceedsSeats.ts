import { TSeatType } from 'components/admin/SeatBasedBilling/SeatInfo';

import fetcher from 'utils/cl-react-query/fetcher';

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

export const checkIfUserExceedsSeats = (queryParams: QueryParams) =>
  fetcher<Response>({
    path: '/users/check_if_exceeds_seats',
    action: 'get',
    queryParams,
  });
