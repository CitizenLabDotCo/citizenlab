import { useInfiniteQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import adminPublicationsKeys from './keys';
import { IAdminPublication, AdminPublicationsKeys } from './types';

const fetchAdminPublication = ({ id }: { id: string | null }) =>
  fetcher<IAdminPublication>({
    path: `/admin_publications/${id}`,
    action: 'get',
  });

const useAdminPublication = (id: string | null) => {
  return useInfiniteQuery<
    IAdminPublication,
    CLErrors,
    IAdminPublication,
    AdminPublicationsKeys
  >({
    queryKey: adminPublicationsKeys.item({ id }),
    queryFn: () => fetchAdminPublication({ id }),
    enabled: !!id,
  });
};

export default useAdminPublication;
