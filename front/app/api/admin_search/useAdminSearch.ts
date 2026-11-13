import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import adminSearchKeys from './keys';
import { AdminSearchKeys, IAdminSearch } from './types';

const fetchAdminSearch = () =>
  fetcher<IAdminSearch>({ path: '/admin_search', action: 'get' });

const useAdminSearch = () => {
  return useQuery<IAdminSearch, CLErrors, IAdminSearch, AdminSearchKeys>({
    queryKey: adminSearchKeys.all(),
    queryFn: fetchAdminSearch,
  });
};

export default useAdminSearch;
