import fetcher from 'utils/cl-react-query/fetcher';
import { IUser } from 'services/users';

export default function getUserDataFromToken(token: string) {
  return fetcher<IUser>({
    path: `/users/by_invite/${token}`,
    action: 'get',
  });
}
