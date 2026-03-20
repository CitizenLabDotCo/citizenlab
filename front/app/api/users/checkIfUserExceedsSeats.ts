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

const fetchCheckIfUserExceedsSeats = (queryParams: QueryParams) =>
  fetcher<Response>({
    path: '/users/check_if_exceeds_seats',
    action: 'get',
    queryParams,
  });

const checkIfUserExceedsSeats = async (queryParams: QueryParams) => {
  const response = await fetchCheckIfUserExceedsSeats(queryParams);
  return response.data.attributes.value;
};

export default checkIfUserExceedsSeats;
