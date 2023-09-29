import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import eventsKeys from './keys';
import { IAvatars, AvatarsKeys, InputParameters } from './types';

const fetchAvatars = ({ enabled: _enabled, ...filters }: InputParameters) => {
  return fetcher<IAvatars>({
    path: '/avatars',
    action: 'get',
    queryParams: filters,
  });
};

const useRandomAvatars = ({
  enabled: enabled,
  ...filters
}: InputParameters) => {
  return useQuery<IAvatars, CLErrors, IAvatars, AvatarsKeys>({
    queryKey: eventsKeys.list(filters),
    queryFn: () => fetchAvatars(filters),
    enabled,
  });
};

export default useRandomAvatars;
