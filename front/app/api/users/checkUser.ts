import fetcher from 'utils/cl-react-query/fetcher';

import { UserCheckResponse } from './types';

export const checkEmail = (email: string) => {
  return fetcher<UserCheckResponse>({
    path: '/users/check_email',
    action: 'post',
    body: { user: { email } },
  });
};

export const checkPhone = (phone: string) => {
  return fetcher<UserCheckResponse>({
    path: '/users/check_phone',
    action: 'post',
    body: { user: { phone } },
  });
};
