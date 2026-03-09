import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import spacesKeys from './keys';
import { Spaces, SpacesKeys } from './types';

const fetchSpaces = () => {
  return fetcher<Spaces>({
    path: `/spaces`,
    action: 'get',
    queryParams: {
      'page[size]': 1000,
      'page[number]': 1,
    },
  });
};

const useSpaces = () => {
  return useQuery<Spaces, CLErrors, Spaces, SpacesKeys>({
    queryKey: spacesKeys.list({}),
    queryFn: () => fetchSpaces(),
  });
};

export default useSpaces;
