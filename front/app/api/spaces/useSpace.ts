import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import spacesKeys from './keys';
import { Space, SpacesKeys } from './types';

const fetchSpace = (id?: string) => {
  return fetcher<Space>({
    path: `/spaces/${id}`,
    action: 'get',
  });
};

const useSpace = (id?: string) => {
  return useQuery<Space, CLErrors, Space, SpacesKeys>({
    queryKey: spacesKeys.item({ id }),
    queryFn: () => fetchSpace(id),
    enabled: !!id,
  });
};

export default useSpace;
