import { useMutation } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import { INotifications } from './types';
import { authUserStream } from 'services/auth';

const markAppAsRead = async () =>
  fetcher<INotifications>({
    path: `/notifications/mark_all_as_read`,
    action: 'post',
    body: null,
  });

const useMarkAllAsRead = () => {
  return useMutation<INotifications, CLErrors>({
    mutationFn: markAppAsRead,
    onSuccess: async () => {
      await authUserStream().fetch();
    },
  });
};

export default useMarkAllAsRead;
