import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import seatsKeys from './keys';
import { ISeats, SeatsKeys } from './types';

const fetchSeats = () =>
  fetcher<ISeats>({
    path: '/users/seats',
    action: 'get',
  });

const useSeats = () => {
  return useQuery<ISeats, CLErrors, ISeats, SeatsKeys>({
    queryKey: seatsKeys.items(),
    queryFn: fetchSeats,
  });
};

export default useSeats;
