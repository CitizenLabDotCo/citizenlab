import fetcher from 'utils/cl-react-query/fetcher';
import { UserCheckResponse } from './types';

const checkUser = (email: string) => {
  return fetcher<UserCheckResponse>({
    path: `/users/check/${email}`,
    action: 'get',
  });
};

export default checkUser;
