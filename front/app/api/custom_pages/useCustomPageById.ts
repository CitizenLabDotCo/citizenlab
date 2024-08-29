import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import customPagesKeys from './keys';
import { ICustomPage, CustomPagesKeys } from './types';

const fetchCustomPage = ({ id }: { id?: string }) =>
  fetcher<ICustomPage>({ path: `/static_pages/${id}`, action: 'get' });

const useCustomPageById = (id?: string) => {
  return useQuery<ICustomPage, CLErrors, ICustomPage, CustomPagesKeys>({
    queryKey: customPagesKeys.item({ id }),
    queryFn: () => fetchCustomPage({ id }),
    enabled: !!id,
  });
};

export default useCustomPageById;
