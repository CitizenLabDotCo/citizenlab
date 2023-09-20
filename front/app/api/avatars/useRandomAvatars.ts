import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import eventsKeys from './keys';
import { IAvatars, AvatarsKeys, InputParameters } from './types';

const fetchAvatars = (filters: InputParameters) => {
  return fetcher<IAvatars>({
    path: '/events',
    action: 'get',
    queryParams: filters,
  });
};

const useRandomAvatars = (filters: InputParameters) => {
  return useQuery<IAvatars, CLErrors, IAvatars, AvatarsKeys>({
    queryKey: eventsKeys.list(filters),
    queryFn: () => fetchAvatars(filters),
  });
};

export default useRandomAvatars;
