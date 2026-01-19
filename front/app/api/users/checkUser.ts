import fetcher from 'utils/cl-react-query/fetcher';

import { UserCheckResponse } from './types';

const checkUser = (email: string) => {
  return fetcher<UserCheckResponse>({
    path: '/users/check',
    action: 'post',
    body: { user: { email } },
  });
};

export default checkUser;
