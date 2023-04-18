import { IUser } from 'services/users';
import fetcher from 'utils/cl-react-query/fetcher';

const getAuthUser = () => {
  return fetcher<IUser>({
    path: `/users/me`,
    action: 'get',
  });
};

export default getAuthUser;
