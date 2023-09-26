import { useMutation } from '@tanstack/react-query';
import { CLErrorsWrapper } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import { IUser, IChangePassword } from './types';

export const changePassword = async (requestBody: IChangePassword) =>
  fetcher<IUser>({
    path: `/users/update_password`,
    action: 'post',
    body: { user: requestBody },
  });

const useChangePassword = () => {
  return useMutation<IUser, CLErrorsWrapper, IChangePassword>({
    mutationFn: changePassword,
  });
};

export default useChangePassword;
