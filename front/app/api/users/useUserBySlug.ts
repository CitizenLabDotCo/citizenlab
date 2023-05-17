import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import userKeys from './keys';
import { IUser, UsersKeys } from './types';

const fetchUserBySlug = ({ slug }: { slug: string | null }) =>
  fetcher<IUser>({
    path: `/user/by_slug/${slug}`,
    action: 'get',
  });

const useUserBySlug = (userSlug: string | null) => {
  return useQuery<IUser, CLErrors, IUser, UsersKeys>({
    queryKey: userKeys.item({ slug: userSlug }),
    queryFn: () => fetchUserBySlug({ slug: userSlug }),
    enabled: !!userSlug,
  });
};

export default useUserBySlug;
