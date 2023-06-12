import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CLErrors } from 'typings';
import fetcher from 'utils/cl-react-query/fetcher';
import { INotifications } from './types';
import meKeys from 'api/me/keys';

const markAppAsRead = async () =>
  fetcher<INotifications>({
    path: `/notifications/mark_all_read`,
    action: 'post',
    body: null,
  });

const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation<INotifications, CLErrors>({
    mutationFn: markAppAsRead,
    onSuccess: async () => {
      queryClient.invalidateQueries({ queryKey: meKeys.all() });
    },
  });
};

export default useMarkAllAsRead;
