import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import userLockedAttributesKeys from './keys';
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
    queryKey: userLockedAttributesKeys.all(),
    queryFn: () => fetchLockedAttributes(),
  });
};

export default useUserLockedAttributes;
