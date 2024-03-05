import { IUser } from 'api/users/types';

import fetcher from 'utils/cl-react-query/fetcher';

export default function getUserDataFromToken(token: string) {
  return fetcher<IUser>({
    path: `/users/by_invite/${token}`,
    action: 'get',
  });
}
