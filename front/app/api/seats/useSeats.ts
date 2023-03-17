import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import seatsKeys from './keys';
import { SeatsType, SeatsKeys } from './types';

const fetchSeats = () =>
  fetcher<SeatsType>({
    path: '/users/seats',
    action: 'get',
  });

const useSeats = () => {
  return useQuery<SeatsType, CLErrors, SeatsType, SeatsKeys>({
    queryKey: seatsKeys.items(),
    queryFn: fetchSeats,
  });
};

export default useSeats;
