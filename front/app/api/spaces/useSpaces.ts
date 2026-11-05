import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import spacesKeys from './keys';
import { Spaces, SpacesKeys } from './types';

type Params = {
  search?: string;
};

const fetchSpaces = ({ search }: Params) => {
  return fetcher<Spaces>({
    path: `/spaces`,
    action: 'get',
    queryParams: {
      'page[size]': 1000,
      'page[number]': 1,
      search,
    },
  });
};

const useSpaces = (params: Params = {}) => {
  return useQuery<Spaces, CLErrors, Spaces, SpacesKeys>({
    queryKey: spacesKeys.list(params),
    queryFn: () => fetchSpaces(params),
  });
};

export default useSpaces;
