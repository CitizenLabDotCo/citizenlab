import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import spacesKeys from './keys';
import { Space, SpacesKeys } from './types';

type IdParam = {
  id: string;
};

const fetchSpace = ({ id }: IdParam) => {
  return fetcher<Space>({
    path: `/spaces/${id}`,
    action: 'get',
  });
};

const useSpace = (idParam: IdParam) => {
  return useQuery<Space, CLErrors, Space, SpacesKeys>({
    queryKey: spacesKeys.item(idParam),
    queryFn: () => fetchSpace(idParam),
  });
};

export default useSpace;
