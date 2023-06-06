import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import userIdeasCountKeys from './keys';
import { UserLockedAttributesKeys, ILockedAttributes } from './types';

const fetchLockedAttributes = () =>
  fetcher<ILockedAttributes>({
    path: `/users/me/locked_attributes`,
    action: 'get',
  });

const useUserLockedAttributes = () => {
  return useQuery<
    ILockedAttributes,
    CLErrors,
    ILockedAttributes,
    UserLockedAttributesKeys
  >({
    queryKey: userIdeasCountKeys.all(),
    queryFn: () => fetchLockedAttributes(),
  });
};

export default useUserLockedAttributes;
