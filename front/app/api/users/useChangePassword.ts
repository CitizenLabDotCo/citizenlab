import { useMutation } from '@tanstack/react-query';
import { CLErrorsJSON } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import { IUser, IChangePassword } from './types';

export const changePassword = async ({
  userId,
  ...requestBody
}: IChangePassword) =>
  fetcher<IUser>({
    path: `/users/${userId}`,
    action: 'post',
    body: { user: { ...requestBody } },
  });

const useChangePassword = () => {
  return useMutation<IUser, CLErrorsJSON, IChangePassword>({
    mutationFn: changePassword,
  });
};

export default useChangePassword;
