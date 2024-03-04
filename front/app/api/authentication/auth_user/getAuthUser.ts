import fetcher from 'utils/cl-react-query/fetcher';

import { IUser } from 'api/users/types';

const getAuthUser = () => {
  return fetcher<IUser>({
    path: `/users/me`,
    action: 'get',
  });
};

export default getAuthUser;
