import { useMutation, useQueryClient } from '@tanstack/react-query';

import fetcher from 'utils/cl-react-query/fetcher';

import emailBansKeys from './keys';

const unbanEmail = (email: string) =>
  fetcher({
    path: `/email_bans/${encodeURIComponent(email)}`,
    action: 'delete',
  });

const useUnbanEmail = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: unbanEmail,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: emailBansKeys.all() });
    },
  });
};

export default useUnbanEmail;
