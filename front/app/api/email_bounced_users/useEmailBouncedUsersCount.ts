import { useQuery } from '@tanstack/react-query';
import { CLErrors } from 'typings';

import fetcher from 'utils/cl-react-query/fetcher';

import emailBouncedUsersCountKeys from './keys';
import { EmailBouncedUsersCountKeys, IEmailBouncedUsersCount } from './types';

const fetchEmailBouncedUsersCount = () =>
  fetcher<IEmailBouncedUsersCount>({
    path: `/users/email_bounced_count`,
    action: 'get',
  });

const useEmailBouncedUsersCount = () => {
  return useQuery<
    IEmailBouncedUsersCount,
    CLErrors,
    IEmailBouncedUsersCount,
    EmailBouncedUsersCountKeys
  >({
    queryKey: emailBouncedUsersCountKeys.items(),
    queryFn: () => fetchEmailBouncedUsersCount(),
  });
};

export default useEmailBouncedUsersCount;
