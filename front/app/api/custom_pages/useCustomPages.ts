import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import customPagesKeys from './keys';
import { ICustomPages, CustomPagesKeys } from './types';

export const fetchCustomPages = () => {
  return fetcher<ICustomPages>({
    path: '/static_pages',
    action: 'get',
  });
};

const useCustomPages = () => {
  return useQuery<ICustomPages, CLErrors, ICustomPages, CustomPagesKeys>({
    queryKey: customPagesKeys.lists(),
    queryFn: () => fetchCustomPages(),
  });
};

export default useCustomPages;
